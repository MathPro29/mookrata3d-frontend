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

    const updates: { status?: string; starts_at?: string; ends_at: string } = body.action === 'close_now'
      ? { status: 'completed', ends_at: new Date().toISOString() }
      : body.action === 'reopen'
        ? { status: 'active', starts_at: new Date().toISOString(), ends_at: new Date(body.ends_at).toISOString() }
        : { ends_at: new Date(body.ends_at).toISOString() };

    const admin = createAdminClient();
    let query = admin.from('voting_sessions').update(updates).eq('id', body.session_id);
    query = body.action === 'reopen' ? query.eq('status', 'completed') : query.eq('status', 'active');
    const { data, error } = await query.select('*').maybeSingle();
    if (error) return jsonResponse({ error: error.message }, 500);
    if (!data) return jsonResponse({ error: body.action === 'reopen' ? 'รอบโหวตนี้เปิดอยู่แล้วหรือไม่มีอยู่' : 'รอบโหวตนี้ปิดไปแล้วหรือไม่มีอยู่' }, 409);

    return jsonResponse({ session: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ตั้งค่ารอบโหวตไม่สำเร็จ';
    return jsonResponse({ error: message }, 500);
  }
});
