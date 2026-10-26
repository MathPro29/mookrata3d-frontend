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
    if (!isValidIdentifier(body.session_id) || !isValidIdentifier(body.place_id)) {
      return jsonResponse({ error: 'Session or restaurant is invalid' }, 400);
    }
    if (body.action !== undefined && body.action !== 'remove') {
      return jsonResponse({ error: 'Vote action is invalid' }, 400);
    }

    const voterHash = await getVoterHash(body.user_id);
    const admin = createAdminClient();
    const isRemoval = body.action === 'remove';
    const { data, error } = await admin.rpc(isRemoval ? 'remove_vote_by_device' : 'cast_or_change_vote_by_device', {
      p_session_id: body.session_id,
      p_place_id: body.place_id,
      p_voter_hash: voterHash,
    });
    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Vote could not be saved';
    const status = message === 'Voter identity is invalid' ? 400 : 500;
    return jsonResponse({ error: message }, status);
  }
});
