import {
  createAdminClient,
  getRequesterIpHash,
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

    const ipHash = await getRequesterIpHash(request);
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('cast_or_change_vote_by_ip', {
      p_session_id: body.session_id,
      p_place_id: body.place_id,
      p_ip_hash: ipHash,
    });
    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Vote could not be saved';
    const status = message.includes('IP is unavailable') ? 503 : 500;
    return jsonResponse({ error: message }, status);
  }
});
