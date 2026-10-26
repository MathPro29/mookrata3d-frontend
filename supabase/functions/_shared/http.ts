import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function handleOptions(request: Request): Response | null {
  return request.method === 'OPTIONS'
    ? new Response('ok', { headers: corsHeaders })
    : null;
}

export function createAdminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) throw new Error('Supabase server configuration is missing');

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isValidIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 160;
}

export async function getVoterHash(value: unknown): Promise<string> {
  if (typeof value !== 'string' || !/^anon_usr_[0-9a-f]{24}$/.test(value)) {
    throw new Error('Voter identity is invalid');
  }
  const secret = Deno.env.get('VOTE_IP_HASH_SECRET');
  if (!secret) throw new Error('Vote hash secret is not configured');
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`voter:${value}`));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
}
