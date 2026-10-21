import { createAdminClient, handleOptions, isValidIdentifier, jsonResponse } from '../_shared/http.ts';

Deno.serve(async request => {
  const preflight = handleOptions(request);
  if (preflight) return preflight;
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const body = await request.json();
    if (!isValidIdentifier(body.session_id)) return jsonResponse({ error: 'Session is invalid' }, 400);

    const admin = createAdminClient();
    const { data, error } = await admin.rpc('finalize_vote_session', { p_session_id: body.session_id });
    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ session: data });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Could not finalize vote' }, 500);
  }
});
