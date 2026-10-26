import {
  createAdminClient,
  getVoterHash,
  handleOptions,
  isValidIdentifier,
  jsonResponse,
} from '../_shared/http.ts';

Deno.serve(async request => {
  const preflight = handleOptions(request);
  if (preflight) return preflight;
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const body = await request.json();
    if (!isValidIdentifier(body.session_id)) {
      return jsonResponse({ error: 'Session is invalid' }, 400);
    }

    const admin = createAdminClient();
    const voterHash = await getVoterHash(body.user_id);
    const { data: lock, error: lockError } = await admin
      .from('vote_device_locks')
      .select('vote_id')
      .eq('session_id', body.session_id)
      .eq('voter_hash', voterHash)
      .maybeSingle();
    if (lockError) return jsonResponse({ error: lockError.message }, 500);
    if (!lock) return jsonResponse({ place_id: null });

    const { data: vote, error: voteError } = await admin
      .from('votes')
      .select('place_id')
      .eq('id', lock.vote_id)
      .maybeSingle();
    if (voteError) return jsonResponse({ error: voteError.message }, 500);
    return jsonResponse({ place_id: vote?.place_id ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Vote status could not be loaded';
    const status = message === 'Voter identity is invalid' ? 400 : 500;
    return jsonResponse({ error: message }, status);
  }
});
