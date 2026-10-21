import assert from 'node:assert/strict';
import { createServer } from 'vite';

globalThis.localStorage = { getItem: () => null };
const server = await createServer({ server: { middlewareMode: true }, envDir: false, appType: 'custom' });

try {
  const { formatRemaining, getWinningPlaces } = await server.ssrLoadModule('/src/components/VotingCountdown.tsx');
  assert.equal(formatRemaining(61_000), '00:01:01');
  assert.equal(formatRemaining(86_401_000), '1 วัน 00:00:01');

  const places = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const votes = [
    { session_id: 'current', place_id: 'a' },
    { session_id: 'current', place_id: 'a' },
    { session_id: 'current', place_id: 'b' },
    { session_id: 'current', place_id: 'b' },
    { session_id: 'old', place_id: 'c' },
    { session_id: 'current', place_id: 'removed-place' },
  ];
  const result = getWinningPlaces(votes, places, 'current');
  assert.equal(result.highestCount, 2);
  assert.deepEqual(result.winners.map(place => place.id), ['a', 'b']);
  assert.deepEqual(getWinningPlaces([], places, 'current').winners, []);
  console.log('Voting countdown checks passed');
} finally {
  await server.close();
}
