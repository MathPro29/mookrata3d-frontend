-- Existing IP-owned votes remain counted, but cannot be attributed to a browser safely.
-- New votes are owned by a server-hashed browser identity instead of a shared IP.
CREATE TABLE public.vote_device_locks (
  session_id TEXT NOT NULL REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
  voter_hash TEXT NOT NULL,
  vote_id UUID NOT NULL UNIQUE REFERENCES public.votes(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, voter_hash)
);
ALTER TABLE public.vote_device_locks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.vote_device_locks FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.vote_device_locks TO service_role;

DROP FUNCTION IF EXISTS public.cast_or_change_vote_by_ip(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.remove_vote_by_ip(TEXT, TEXT, TEXT);

CREATE FUNCTION public.cast_or_change_vote_by_device(
  p_session_id TEXT, p_place_id TEXT, p_voter_hash TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session public.voting_sessions%ROWTYPE;
  v_vote_id UUID;
  v_previous_place_id TEXT;
  v_action TEXT;
BEGIN
  SELECT * INTO v_session FROM public.voting_sessions
  WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR v_session.status <> 'active'
    OR now() < v_session.starts_at OR now() > v_session.ends_at THEN
    RAISE EXCEPTION 'Voting session is not active or has ended';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.voting_session_places
    WHERE session_id = p_session_id AND place_id = p_place_id
  ) THEN
    RAISE EXCEPTION 'Place is not a registered candidate for this voting session';
  END IF;

  SELECT l.vote_id, v.place_id INTO v_vote_id, v_previous_place_id
  FROM public.vote_device_locks l
  JOIN public.votes v ON v.id = l.vote_id
  WHERE l.session_id = p_session_id AND l.voter_hash = p_voter_hash;

  IF FOUND THEN
    IF v_previous_place_id = p_place_id THEN
      v_action := 'NO_CHANGE';
    ELSE
      UPDATE public.votes SET place_id = p_place_id, updated_at = now()
      WHERE id = v_vote_id;
      v_action := 'VOTE_CHANGED';
    END IF;
  ELSE
    INSERT INTO public.votes (session_id, place_id, user_id, created_at, updated_at)
    VALUES (p_session_id, p_place_id, 'device-voter-' || gen_random_uuid()::text, now(), now())
    RETURNING id INTO v_vote_id;
    INSERT INTO public.vote_device_locks (session_id, voter_hash, vote_id)
    VALUES (p_session_id, p_voter_hash, v_vote_id);
    v_action := 'VOTE_CAST';
  END IF;

  RETURN jsonb_build_object(
    'success', true, 'action', v_action, 'session_id', p_session_id,
    'place_id', p_place_id, 'previous_place_id', v_previous_place_id
  );
END;
$$;

CREATE FUNCTION public.remove_vote_by_device(
  p_session_id TEXT, p_place_id TEXT, p_voter_hash TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session public.voting_sessions%ROWTYPE;
  v_vote_id UUID;
BEGIN
  SELECT * INTO v_session FROM public.voting_sessions
  WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR v_session.status <> 'active'
    OR now() < v_session.starts_at OR now() > v_session.ends_at THEN
    RAISE EXCEPTION 'Voting session is not active or has ended';
  END IF;

  SELECT v.id INTO v_vote_id
  FROM public.vote_device_locks l
  JOIN public.votes v ON v.id = l.vote_id
  WHERE l.session_id = p_session_id AND l.voter_hash = p_voter_hash
    AND v.place_id = p_place_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'action', 'NO_VOTE');
  END IF;

  DELETE FROM public.votes WHERE id = v_vote_id;
  RETURN jsonb_build_object(
    'success', true, 'action', 'VOTE_REMOVED',
    'session_id', p_session_id, 'place_id', p_place_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cast_or_change_vote_by_device(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.remove_vote_by_device(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cast_or_change_vote_by_device(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.remove_vote_by_device(TEXT, TEXT, TEXT) TO service_role;
