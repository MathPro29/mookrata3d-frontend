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

function requestIp(request: Request): string {
  // Supabase's Edge Function example reads the originating client from the
  // first forwarded hop. Never accept an IP supplied in the JSON body.
  const forwarded = request.headers.get('x-forwarded-for');
  const rawIp = forwarded?.split(',').map(value => value.trim()).filter(Boolean)[0]
    || request.headers.get('x-real-ip')?.trim();
  if (!rawIp || rawIp.length > 128) throw new Error('Client IP is unavailable');

  let ip = rawIp.toLowerCase().replace(/^::ffff:/, '').replace(/%[^%]+$/, '');
  if (ip.startsWith('[') && ip.includes(']')) ip = ip.slice(1, ip.indexOf(']'));
  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) ip = ip.slice(0, ip.lastIndexOf(':'));
  return ip;
}

export async function getRequesterIpHash(request: Request): Promise<string> {
  const secret = Deno.env.get('VOTE_IP_HASH_SECRET');
  if (!secret) throw new Error('IP hash secret is not configured');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(requestIp(request)),
  );
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function isValidIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 160;
}
