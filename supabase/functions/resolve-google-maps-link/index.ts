import { handleOptions, jsonResponse } from '../_shared/http.ts';

const isGoogleMapsHost = (host: string) =>
  host === 'goo.gl' || host === 'maps.app.goo.gl' || host === 'google.com' || host.endsWith('.google.com');

const getCoordinates = (url: URL) => {
  const text = url.href;
  const match = text.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
    || text.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
    || url.search.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const reversedMatch = text.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
  if (!match && !reversedMatch) return null;
  const latitude = Number(match ? match[1] : reversedMatch![2]);
  const longitude = Number(match ? match[2] : reversedMatch![1]);
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    ? { latitude, longitude }
    : null;
};

Deno.serve(async request => {
  const preflight = handleOptions(request);
  if (preflight) return preflight;
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const body = await request.json();
    if (typeof body.url !== 'string' || body.url.length > 2048) {
      return jsonResponse({ error: 'Google Maps link is invalid' }, 400);
    }

    let current = new URL(body.url);
    if (current.protocol !== 'https:' || !isGoogleMapsHost(current.hostname)) {
      return jsonResponse({ error: 'Only Google Maps links are supported' }, 400);
    }

    for (let redirects = 0; redirects <= 5; redirects++) {
      const response = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(8000) });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      if (!location || redirects === 5) return jsonResponse({ error: 'Google Maps link has too many redirects' }, 400);
      const next = new URL(location, current);
      if (next.protocol !== 'https:' || !isGoogleMapsHost(next.hostname)) {
        return jsonResponse({ error: 'Google Maps redirected to an unsupported address' }, 400);
      }
      current = next;
    }

    const coordinates = getCoordinates(current);
    if (!coordinates) return jsonResponse({ error: 'Could not find coordinates in this Google Maps link' }, 422);
    const nameMatch = current.pathname.match(/\/maps\/place\/([^/]+)/);
    const name = nameMatch ? decodeURIComponent(nameMatch[1].replaceAll('+', ' ')) : undefined;
    return jsonResponse({ url: current.href, ...coordinates, name });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not resolve Google Maps link';
    return jsonResponse({ error: message }, 400);
  }
});
