'use strict';

const axios = require('axios');

const CANONICAL_OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

function openRouterConfig(env = process.env) {
  const apiKey = (env.OPENROUTER_API_KEY || '').trim();
  const model = (env.OPENROUTER_MODEL || '').trim();
  const baseUrl = (env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is required');
  if (!model) throw new Error('OPENROUTER_MODEL is required');
  if (baseUrl !== CANONICAL_OPENROUTER_BASE_URL) {
    throw new Error(`OPENROUTER_BASE_URL must be ${CANONICAL_OPENROUTER_BASE_URL}`);
  }
  return { apiKey, model, baseUrl };
}

async function requestOperationsReadiness(workflowSummary, request = axios.post) {
  const config = openRouterConfig();
  const response = await request(
    `${config.baseUrl}/chat/completions`,
    {
      model: config.model,
      temperature: 0.2,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: 'You review deidentified blood-bank administrative workflow controls. Discuss traceability, authorization, inventory reconciliation, escalation, and human review. Never determine donor eligibility, compatibility, allocation, diagnosis, treatment, urgency, or transfusion suitability. Provide concise operational readiness findings and explicitly leave regulated decisions to qualified staff.',
        },
        { role: 'user', content: workflowSummary },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://127.0.0.1',
        'X-Title': 'Blood Bank Operations Readiness',
      },
      timeout: 120000,
    },
  );

  const result = response.data?.choices?.[0]?.message?.content?.trim();
  const requestId = response.data?.id;
  const providerModel = response.data?.model || config.model;
  if (!requestId || !result || result.length < 40) throw new Error('OpenRouter returned incomplete evidence');
  return {
    result,
    providerReceipt: {
      provider: 'openrouter',
      requestId,
      model: providerModel,
      created: response.data?.created || null,
      usage: response.data?.usage || null,
    },
  };
}

module.exports = { CANONICAL_OPENROUTER_BASE_URL, openRouterConfig, requestOperationsReadiness };
