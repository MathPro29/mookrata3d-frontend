-- Preserve the winner for the end-of-round popup, then clear votes and IP locks.
ALTER TABLE public.voting_sessions
ADD COLUMN IF NOT EXISTS final_results JSONB;

CREATE OR REPLACE FUNCTION public.finalize_vote_session(p_session_id TEXT)
RETURNS public.voting_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.voting_sessions%ROWTYPE;
  v_total INTEGER;
  v_highest INTEGER;
  v_winners JSONB;
BEGIN
  SELECT * INTO v_session FROM public.voting_sessions
  WHERE id = p_session_id FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Voting session does not exist'; END IF;
  IF v_session.final_results IS NOT NULL THEN RETURN v_session; END IF;
  IF v_session.status <> 'completed' AND
    (v_session.status <> 'active' OR now() < v_session.ends_at) THEN
    RAISE EXCEPTION 'Voting session has not ended';
  END IF;

  SELECT COALESCE(SUM(vote_count), 0), COALESCE(MAX(vote_count), 0)
  INTO v_total, v_highest
  FROM (
    SELECT COUNT(*)::INTEGER AS vote_count
    FROM public.votes v
    JOIN public.voting_session_places c ON c.session_id = v.session_id AND c.place_id = v.place_id
    WHERE v.session_id = p_session_id GROUP BY v.place_id
  ) counts;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object('place_id', place_id, 'name', name, 'votes_count', vote_count)
    ORDER BY place_id
  ), '[]'::jsonb)
  INTO v_winners
  FROM (
    SELECT v.place_id, p.name, COUNT(*)::INTEGER AS vote_count
    FROM public.votes v
    JOIN public.voting_session_places c ON c.session_id = v.session_id AND c.place_id = v.place_id
    JOIN public.places p ON p.id = v.place_id
    WHERE v.session_id = p_session_id GROUP BY v.place_id, p.name
  ) counts
  WHERE vote_count = v_highest AND v_highest > 0;

  UPDATE public.voting_sessions
  SET status = 'completed',
      final_results = jsonb_build_object(
        'winners', v_winners,
        'winning_vote_count', v_highest,
        'total_votes', v_total
      )
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  DELETE FROM public.votes WHERE session_id = p_session_id;
  RETURN v_session;
END;
$$;

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
  UPDATE public.voting_sessions
  SET status = 'active', starts_at = now(), ends_at = p_ends_at,
      final_results = NULL
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  RETURN v_session;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_vote_session(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_vote_session(TEXT) TO service_role;
REVOKE ALL ON FUNCTION public.start_new_vote_round(TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_new_vote_round(TEXT, TIMESTAMPTZ) TO service_role;
