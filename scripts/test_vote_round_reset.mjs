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
  const [first, second] = await VotingService.getPlaces();
  const sessionId = 'test-round';
  const past = new Date(Date.now() - 60_000).toISOString();
  storage.set('cm_map_local_session_v1', JSON.stringify({
    id: sessionId, title: 'Test round', status: 'active', starts_at: past, ends_at: past,
  }));
  storage.set('cm_map_local_votes_v1', JSON.stringify([
    { id: 'test-1', session_id: sessionId, place_id: first.id, user_id: 'a' },
    { id: 'test-2', session_id: sessionId, place_id: first.id, user_id: 'b' },
    { id: 'test-3', session_id: sessionId, place_id: second.id, user_id: 'c' },
    { id: 'other-1', session_id: 'other-round', place_id: second.id, user_id: 'd' },
  ]));

  const completed = await VotingService.getActiveSession();
  assert.equal(completed.status, 'completed');
  assert.equal(completed.final_results.total_votes, 3);
  assert.equal(completed.final_results.winning_vote_count, 2);
  assert.deepEqual(completed.final_results.winners.map(winner => winner.place_id), [first.id]);
  assert.equal((await VotingService.getVotes(sessionId)).length, 3);
  assert.equal(JSON.parse(storage.get('cm_map_local_votes_v1')).length, 4);
  assert.deepEqual((await VotingService.finalizeSession(sessionId)).final_results, completed.final_results);
  console.log('Vote round finalization checks passed');
} finally {
  await server.close();
}
