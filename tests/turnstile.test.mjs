import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyTurnstile } from '../lib/turnstile.mjs';

test('verifyTurnstile accepts a successful verification for the expected host', async () => {
  const result = await verifyTurnstile({ token: 'token', secret: 'secret', fetchImpl: async () => ({ ok: true, json: async () => ({ success: true, hostname: 'www.coastalcarpentrysrq.com' }) }) });
  assert.equal(result, true);
});

test('verifyTurnstile rejects missing tokens, invalid verification, and unexpected hosts', async () => {
  assert.equal(await verifyTurnstile({ token: '', secret: 'secret' }), false);
  assert.equal(await verifyTurnstile({ token: 'token', secret: 'secret', fetchImpl: async () => ({ ok: true, json: async () => ({ success: false }) }) }), false);
  assert.equal(await verifyTurnstile({ token: 'token', secret: 'secret', fetchImpl: async () => ({ ok: true, json: async () => ({ success: true, hostname: 'example.com' }) }) }), false);
});
