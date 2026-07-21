'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { assessComponentForAllocation, recordVerification } = require('../domain/bloodLifecycle');

const valid = () => ({ donorId: 'd1', collectionId: 'c1', componentId: 'p1', donorAbo: 'O', donorRh: '+', recipientAbo: 'O', recipientRh: '+', expiresAt: '2030-01-01T00:00:00Z', barcode: 'BC1', identityVerified: true, eligibilityStatus: 'eligible', quarantineStatus: 'released', coldChainStatus: 'within_range', tests: [{ name: 'screen', result: 'nonreactive', lot: 'lot1', performedAt: '2026-01-01T00:00:00Z' }], traceEvents: ['collection', 'testing', 'component'].map((kind) => ({ kind, evidenceRef: `ref:${kind}` })) });

test('requires complete traceability and dual verification', () => {
  const assessment = assessComponentForAllocation(valid(), new Date('2026-01-02T00:00:00Z'));
  assert.equal(assessment.status, 'awaiting_dual_verification');
  const first = recordVerification(assessment, [], { id: 't1', role: 'technologist' });
  assert.equal(first.status, 'awaiting_dual_verification');
  const second = recordVerification(assessment, first.approvals, { id: 's1', role: 'supervisor' });
  assert.equal(second.status, 'allocated_pending_hospital_ack');
});

test('fails closed on incompatible or expired components', () => {
  const record = valid(); record.recipientAbo = 'A'; record.expiresAt = '2025-01-01T00:00:00Z';
  const result = assessComponentForAllocation(record, new Date('2026-01-02T00:00:00Z'));
  assert.equal(result.status, 'blocked');
  assert.ok(result.blockers.some((b) => b.code === 'VALIDATED_COMPATIBILITY_POLICY_REQUIRED'));
  assert.throws(() => recordVerification(result, [], { id: 't1', role: 'technologist' }), /cannot be allocated/);
});
