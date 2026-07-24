'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { openRouterConfig, requestOperationsReadiness } = require('../services/openrouterEvidence');

test('requires the canonical OpenRouter endpoint', () => {
  assert.throws(
    () => openRouterConfig({ OPENROUTER_API_KEY: 'test', OPENROUTER_MODEL: 'model', OPENROUTER_BASE_URL: 'https://example.invalid' }),
    /must be https:\/\/openrouter\.ai\/api\/v1/,
  );
});

test('returns substantive provider evidence', async () => {
  const previous = {
    key: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL,
    base: process.env.OPENROUTER_BASE_URL,
  };
  process.env.OPENROUTER_API_KEY = 'test-key';
  process.env.OPENROUTER_MODEL = 'test-model';
  process.env.OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
  try {
    const evidence = await requestOperationsReadiness('A deidentified administrative workflow with human review.', async (url, body) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
      assert.equal(body.model, 'test-model');
      return { data: { id: 'req_test', model: 'test-model', choices: [{ message: { content: 'Operational controls are documented, auditable, and subject to qualified human review.' } }] } };
    });
    assert.equal(evidence.providerReceipt.requestId, 'req_test');
    assert.ok(evidence.result.length >= 40);
  } finally {
    process.env.OPENROUTER_API_KEY = previous.key;
    process.env.OPENROUTER_MODEL = previous.model;
    process.env.OPENROUTER_BASE_URL = previous.base;
  }
});
