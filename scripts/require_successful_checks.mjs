#!/usr/bin/env node
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const TERMINAL = new Set(['completed']);

export function selectExactRun(runs, sha) {
  const exact = runs
    .filter(run => run?.head_sha === sha && run?.event === 'push')
    .sort((a, b) => (b.run_attempt ?? 0) - (a.run_attempt ?? 0) || (b.id ?? 0) - (a.id ?? 0));
  return exact[0] ?? null;
}

export async function requireSuccessfulChecks({
  repository,
  sha,
  token,
  timeoutMs = 20 * 60_000,
  intervalMs = 10_000,
  fetchImpl = fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
}) {
  assert.match(repository, /^[^/]+\/[^/]+$/, 'repository must be owner/name');
  assert.match(sha, /^[0-9a-f]{40}$/i, 'sha must be a full commit SHA');
  assert.ok(token, 'GITHUB_TOKEN is required');
  const deadline = Date.now() + timeoutMs;
  const url = `https://api.github.com/repos/${repository}/actions/workflows/checks.yml/runs?branch=main&event=push&per_page=100`;

  while (Date.now() < deadline) {
    const response = await fetchImpl(url, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'x-github-api-version': '2022-11-28',
      },
    });
    if (!response.ok) throw new Error(`checks lookup failed with HTTP ${response.status}`);
    const run = selectExactRun((await response.json()).workflow_runs ?? [], sha);
    if (!run) {
      console.log(`waiting for checks.yml push run at ${sha}`);
    } else if (TERMINAL.has(run.status)) {
      if (run.conclusion !== 'success') {
        throw new Error(`checks.yml run ${run.id} for ${sha} concluded ${run.conclusion}`);
      }
      console.log(`checks.yml run ${run.id} succeeded for exact SHA ${sha}`);
      return run;
    } else {
      console.log(`waiting for checks.yml run ${run.id} at ${sha}: ${run.status}`);
    }
    await sleep(intervalMs);
  }
  throw new Error(`timed out waiting for successful checks.yml at ${sha}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await requireSuccessfulChecks({
    repository: process.env.GITHUB_REPOSITORY ?? '',
    sha: process.env.GITHUB_SHA ?? '',
    token: process.env.GITHUB_TOKEN ?? '',
    timeoutMs: Number(process.env.CHECKS_GATE_TIMEOUT_MS ?? 20 * 60_000),
  });
}
