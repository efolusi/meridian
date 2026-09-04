import assert from 'node:assert/strict';
import test from 'node:test';
import { requireSuccessfulChecks, selectExactRun } from './require_successful_checks.mjs';

const SHA = 'a'.repeat(40);

test('selects only the newest exact-SHA push attempt', () => {
  const selected = selectExactRun([
    { id: 1, head_sha: SHA, event: 'pull_request', run_attempt: 9 },
    { id: 2, head_sha: 'b'.repeat(40), event: 'push', run_attempt: 9 },
    { id: 3, head_sha: SHA, event: 'push', run_attempt: 1 },
    { id: 4, head_sha: SHA, event: 'push', run_attempt: 2 },
  ], SHA);
  assert.equal(selected.id, 4);
});

test('waits for the exact run and accepts success', async () => {
  const payloads = [
    { workflow_runs: [] },
    { workflow_runs: [{ id: 7, head_sha: SHA, event: 'push', status: 'in_progress', conclusion: null }] },
    { workflow_runs: [{ id: 7, head_sha: SHA, event: 'push', status: 'completed', conclusion: 'success' }] },
  ];
  const run = await requireSuccessfulChecks({
    repository: 'efolusi/meridian', sha: SHA, token: 'test', intervalMs: 0,
    fetchImpl: async () => ({ ok: true, json: async () => payloads.shift() }),
    sleep: async () => {},
  });
  assert.equal(run.id, 7);
});

test('fails closed when exact-SHA checks are terminal red', async () => {
  await assert.rejects(requireSuccessfulChecks({
    repository: 'efolusi/meridian', sha: SHA, token: 'test', intervalMs: 0,
    fetchImpl: async () => ({ ok: true, json: async () => ({ workflow_runs: [
      { id: 8, head_sha: SHA, event: 'push', status: 'completed', conclusion: 'failure' },
    ] }) }),
    sleep: async () => {},
  }), /concluded failure/);
});
