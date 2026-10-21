-- Let a voter remove only their own vote during an active session.
CREATE OR REPLACE FUNCTION public.remove_vote_by_ip(
  p_session_id TEXT,
  p_place_id TEXT,
  p_ip_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.voting_sessions%ROWTYPE;
  v_vote_id UUID;
BEGIN
  SELECT * INTO v_session
  FROM public.voting_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND OR v_session.status <> 'active'
    OR now() < v_session.starts_at OR now() > v_session.ends_at THEN
    RAISE EXCEPTION 'Voting session is not active or has ended';
  END IF;

  SELECT v.id INTO v_vote_id
  FROM public.vote_ip_locks l
  JOIN public.votes v ON v.id = l.vote_id
  WHERE l.session_id = p_session_id
    AND l.ip_hash = p_ip_hash
    AND v.place_id = p_place_id
  FOR UPDATE OF v;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'action', 'NO_VOTE');
  END IF;

  -- The private IP lock references this vote with ON DELETE CASCADE.
  DELETE FROM public.votes WHERE id = v_vote_id;

  RETURN jsonb_build_object(
    'success', true,
    'action', 'VOTE_REMOVED',
    'session_id', p_session_id,
    'place_id', p_place_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.remove_vote_by_ip(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remove_vote_by_ip(TEXT, TEXT, TEXT) TO service_role;
