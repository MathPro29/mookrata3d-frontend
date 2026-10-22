import { createAdminClient, handleOptions, isValidIdentifier, jsonResponse } from '../_shared/http.ts';

Deno.serve(async request => {
  const preflight = handleOptions(request);
  if (preflight) return preflight;
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const adminKey = Deno.env.get('VOTE_ADMIN_KEY');
  const suppliedKey = request.headers.get('x-admin-key');
  if (!adminKey || !suppliedKey || suppliedKey !== adminKey) {
    return jsonResponse({ error: 'รหัสผู้ดูแลไม่ถูกต้อง' }, 401);
  }

  try {
    const body = await request.json();
    if (!isValidIdentifier(body.session_id) || !['set_end_time', 'close_now', 'reopen'].includes(body.action)) {
      return jsonResponse({ error: 'คำสั่งหรือรอบโหวตไม่ถูกต้อง' }, 400);
    }

    if (body.action !== 'close_now' &&
      (!body.ends_at || !Number.isFinite(Date.parse(body.ends_at)) || Date.parse(body.ends_at) <= Date.now())) {
      return jsonResponse({ error: 'เวลาปิดโหวตต้องอยู่ในอนาคต' }, 400);
    }

    const admin = createAdminClient();
    if (body.action === 'reopen') {
      const { data, error } = await admin.rpc('start_new_vote_round', {
        p_session_id: body.session_id,
        p_ends_at: new Date(body.ends_at).toISOString(),
      });
      if (error) return jsonResponse({ error: error.message }, 409);
      return jsonResponse({ session: data });
    }

    const updates = body.action === 'close_now'
      ? { status: 'completed', ends_at: new Date().toISOString() }
      : { ends_at: new Date(body.ends_at).toISOString() };
    const query = admin.from('voting_sessions').update(updates).eq('id', body.session_id).eq('status', 'active');
    const { data, error } = await query.select('*').maybeSingle();
    if (error) return jsonResponse({ error: error.message }, 500);
    if (!data) return jsonResponse({ error: 'รอบโหวตนี้ปิดไปแล้วหรือไม่มีอยู่' }, 409);

    if (body.action === 'close_now') {
      const finalized = await admin.rpc('finalize_vote_session', { p_session_id: body.session_id });
      if (finalized.error) return jsonResponse({ error: finalized.error.message }, 500);
      return jsonResponse({ session: finalized.data });
    }

    return jsonResponse({ session: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ตั้งค่ารอบโหวตไม่สำเร็จ';
    return jsonResponse({ error: message }, 500);
  }
});
