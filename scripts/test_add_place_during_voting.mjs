import assert from 'node:assert/strict';
import { createServer } from 'vite';

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
};

const server = await createServer({ server: { middlewareMode: true }, envDir: false, appType: 'custom' });
try {
  const { VotingService } = await server.ssrLoadModule('/src/services/votingService.ts');
  const [firstPlace] = await VotingService.getPlaces();
  const sessionId = 'live-round';
  storage.set('cm_map_local_session_v1', JSON.stringify({
    id: sessionId,
    title: 'Live round',
    status: 'active',
    starts_at: new Date(Date.now() - 60_000).toISOString(),
    ends_at: new Date(Date.now() + 60_000).toISOString(),
  }));
  const existingVotes = [
    { id: 'vote-1', session_id: sessionId, place_id: firstPlace.id, user_id: 'a' },
    { id: 'vote-2', session_id: sessionId, place_id: firstPlace.id, user_id: 'b' },
  ];
  storage.set('cm_map_local_votes_v1', JSON.stringify(existingVotes));

  const created = await VotingService.addPlace({
    zone_id: firstPlace.zone_id,
    name: 'Test shop added during voting',
    description: 'Test place',
    address: 'Chiang Mai',
    latitude: 18.8,
    longitude: 98.98,
    image_url: '',
    google_maps_url: '',
    category: 'ร้านอาหาร & หมูกระทะ',
    verification_status: 'verified',
  });

  assert.equal(created.is_voting_candidate, true);
  const sessionPlaces = await VotingService.getPlaces(sessionId);
  assert.ok(sessionPlaces.some(place => place.id === created.id));
  const votesAfterAdding = await VotingService.getVotes(sessionId);
  assert.deepEqual(votesAfterAdding, existingVotes);
  console.log('Adding a place during voting preserves existing votes');
} finally {
  await server.close();
}
