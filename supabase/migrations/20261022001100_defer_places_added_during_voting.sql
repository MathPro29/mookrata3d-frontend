-- Places added during a live round appear on the map now and become vote
-- choices atomically when the next round starts.
CREATE TABLE IF NOT EXISTS public.pending_voting_session_places (
  session_id TEXT NOT NULL REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, place_id)
);

ALTER TABLE public.pending_voting_session_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pending candidates are viewable by everyone"
ON public.pending_voting_session_places FOR SELECT USING (true);
CREATE POLICY "Public can defer valid mookata candidates"
ON public.pending_voting_session_places FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.voting_sessions s
    JOIN public.places p ON p.id = place_id
    WHERE s.id = pending_voting_session_places.session_id
      AND s.status = 'active' AND now() BETWEEN s.starts_at AND s.ends_at
      AND p.zone_id IN ('zone-jed-yod', 'zone-old-city', 'zone-chang-khlan', 'zone-nimman', 'zone-chang-phueak')
      AND p.category ILIKE '%หมูกระทะ%'
  )
);

DROP POLICY IF EXISTS "Public can add mookata candidates to active session" ON public.voting_session_places;
CREATE POLICY "Public can add mookata candidates outside live voting"
ON public.voting_session_places FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.voting_sessions s
    JOIN public.places p ON p.id = place_id
    WHERE s.id = voting_session_places.session_id
      AND (s.status = 'completed' OR s.status = 'draft' OR now() NOT BETWEEN s.starts_at AND s.ends_at)
      AND p.zone_id IN ('zone-jed-yod', 'zone-old-city', 'zone-chang-khlan', 'zone-nimman', 'zone-chang-phueak')
      AND p.category ILIKE '%หมูกระทะ%'
  )
);

CREATE OR REPLACE FUNCTION public.start_new_vote_round(
  p_session_id TEXT,
  p_ends_at TIMESTAMPTZ
)
RETURNS public.voting_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.voting_sessions%ROWTYPE;
BEGIN
  SELECT * INTO v_session FROM public.voting_sessions
  WHERE id = p_session_id FOR UPDATE;

  IF NOT FOUND OR v_session.status <> 'completed' THEN
    RAISE EXCEPTION 'Voting session is not closed';
  END IF;
  IF p_ends_at IS NULL OR p_ends_at <= now() THEN
    RAISE EXCEPTION 'End time must be in the future';
  END IF;

  DELETE FROM public.votes WHERE session_id = p_session_id;
  INSERT INTO public.voting_session_places (session_id, place_id)
  SELECT session_id, place_id FROM public.pending_voting_session_places
  WHERE session_id = p_session_id
  ON CONFLICT DO NOTHING;
  DELETE FROM public.pending_voting_session_places WHERE session_id = p_session_id;

  UPDATE public.voting_sessions
  SET status = 'active', starts_at = now(), ends_at = p_ends_at,
      final_results = NULL
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  RETURN v_session;
END;
$$;

REVOKE ALL ON FUNCTION public.start_new_vote_round(TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_new_vote_round(TEXT, TIMESTAMPTZ) TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'pending_voting_session_places'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_voting_session_places;
  END IF;
END;
$$;
