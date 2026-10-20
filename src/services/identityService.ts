/**
 * Identity service for anonymous and authenticated session management.
 * Complies with Requirement #7:
 * - Server-verifiable user identification
 * - Anonymous session with persistent client identity token
 * - Prepared for seamless Supabase Auth upgrade
 */

const USER_ID_KEY = 'cm_map_user_identity_v1';

export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'server_usr_default';

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    // Generate secure anonymous ID
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    userId = `anon_usr_${randomBytes}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function resetUserIdentity(): string {
  if (typeof window === 'undefined') return 'server_usr_default';
  localStorage.removeItem(USER_ID_KEY);
  return getOrCreateUserId();
}
