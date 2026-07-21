'use strict';
const crypto = require('crypto');

class BloodWorkflowError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

function assessComponentForAllocation(input, now = new Date()) {
  if (!input || typeof input !== 'object') throw new BloodWorkflowError('INVALID_INPUT', 'component record is required');
  const blockers = [];
  const required = ['donorId', 'collectionId', 'componentId', 'donorAbo', 'donorRh', 'recipientAbo', 'recipientRh', 'expiresAt', 'barcode'];
  for (const field of required) if (typeof input[field] !== 'string' || !input[field].trim()) blockers.push({ code: 'FIELD_REQUIRED', field });
  if (input.identityVerified !== true) blockers.push({ code: 'IDENTITY_NOT_VERIFIED' });
  if (input.eligibilityStatus !== 'eligible') blockers.push({ code: 'DONOR_NOT_ELIGIBLE' });
  if (!Array.isArray(input.tests) || input.tests.length === 0) blockers.push({ code: 'TEST_RESULTS_REQUIRED' });
  for (const test of input.tests || []) if (test.result !== 'nonreactive' || !test.lot || !test.performedAt) blockers.push({ code: 'TEST_NOT_CLEARED', test: test.name || 'unknown' });
  if (input.quarantineStatus !== 'released') blockers.push({ code: 'COMPONENT_NOT_RELEASED' });
  if (Number.isNaN(Date.parse(input.expiresAt)) || Date.parse(input.expiresAt) <= now.getTime()) blockers.push({ code: 'COMPONENT_EXPIRED' });
  if (input.coldChainStatus !== 'within_range') blockers.push({ code: 'COLD_CHAIN_EXCEPTION' });
  // Conservative local rule: exact ABO/Rh match only. Broader compatibility requires validated policy/configuration.
  if (input.donorAbo !== input.recipientAbo || input.donorRh !== input.recipientRh) blockers.push({ code: 'VALIDATED_COMPATIBILITY_POLICY_REQUIRED' });
  if (!Array.isArray(input.traceEvents) || !['collection', 'testing', 'component'].every((kind) => input.traceEvents.some((event) => event.kind === kind && event.evidenceRef))) {
    blockers.push({ code: 'TRACEABILITY_INCOMPLETE' });
  }
  const canonical = { ...input, assessedAt: now.toISOString() };
  return {
    ...canonical,
    assessmentHash: crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex'),
    blockers,
    status: blockers.length ? 'blocked' : 'awaiting_dual_verification',
    disclaimer: 'Local fail-safe screening only; requires validated clinical policy and licensed-system integration before use.',
  };
}

function recordVerification(assessment, approvals, actor) {
  if (!assessment || assessment.status === 'blocked') throw new BloodWorkflowError('INVALID_TRANSITION', 'blocked components cannot be allocated');
  if (!actor || !['technologist', 'supervisor'].includes(actor.role)) throw new BloodWorkflowError('FORBIDDEN', 'qualified verification role required');
  const next = [...(approvals || [])];
  if (next.some((approval) => approval.actorId === actor.id)) throw new BloodWorkflowError('DUPLICATE_APPROVAL', 'two distinct verifiers are required');
  next.push({ actorId: actor.id, role: actor.role, at: new Date().toISOString() });
  return { approvals: next, status: next.length >= 2 ? 'allocated_pending_hospital_ack' : 'awaiting_dual_verification' };
}

module.exports = { BloodWorkflowError, assessComponentForAllocation, recordVerification };
