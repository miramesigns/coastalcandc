import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEstimateRequest } from '../lib/request-estimate.mjs';

test('parseEstimateRequest accepts a complete customer estimate request', () => {
  assert.deepEqual(parseEstimateRequest({
    name: 'Alex Customer', email: 'alex@example.com', phone: '941-555-0101',
    projectType: 'Custom cabinetry', location: 'Sarasota, FL', details: 'Need a built-in for the living room.',
    company: '',
  }), {
    name: 'Alex Customer', email: 'alex@example.com', phone: '941-555-0101',
    projectType: 'Custom cabinetry', location: 'Sarasota, FL', details: 'Need a built-in for the living room.',
  });
});

test('parseEstimateRequest rejects invalid customer email and spam honeypot', () => {
  assert.throws(() => parseEstimateRequest({ name: 'A', email: 'bad', phone: '', projectType: '', location: '', details: 'x', company: '' }), /valid email/);
  assert.throws(() => parseEstimateRequest({ name: 'Alex', email: 'alex@example.com', phone: '', projectType: '', location: '', details: 'x', company: 'bot' }), /Unable to submit/);
});
