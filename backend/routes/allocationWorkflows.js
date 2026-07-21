'use strict';
const crypto = require('crypto');
const express = require('express');
const pool = require('../db');
const { BloodWorkflowError, assessComponentForAllocation, recordVerification } = require('../domain/bloodLifecycle');
const router = express.Router();
const tenantFor = (user) => user.tenantId;

router.post('/', async (req, res, next) => {
  const key = req.get('Idempotency-Key');
  if (!key || key.length > 200) return res.status(400).json({ error: 'A valid Idempotency-Key header is required' });
  let assessment;
  try { assessment = assessComponentForAllocation(req.body); }
  catch (error) { return res.status(422).json({ error: error.message, code: error.code }); }
  const hash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');
  const client = await pool.connect().catch(() => null);
  if (!client) return res.status(503).json({ error: 'Workflow store unavailable', code: 'STORE_UNAVAILABLE' });
  try {
    await client.query('BEGIN'); const id = crypto.randomUUID();
    const inserted = await client.query(`INSERT INTO blood_allocation_workflows
      (id,tenant_id,idempotency_key,request_hash,component_id,status,assessment,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (tenant_id,idempotency_key) DO NOTHING RETURNING *`,
      [id, tenantFor(req.user), key, hash, assessment.componentId, assessment.status, assessment, req.user.id]);
    let workflow = inserted.rows[0];
    if (!workflow) {
      workflow = (await client.query('SELECT * FROM blood_allocation_workflows WHERE tenant_id=$1 AND idempotency_key=$2', [tenantFor(req.user), key])).rows[0];
      if (workflow.request_hash !== hash) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'Idempotency-Key was reused with different input' }); }
      await client.query('COMMIT'); return res.json({ workflow, replayed: true });
    }
    await client.query(`INSERT INTO blood_allocation_events (id,workflow_id,tenant_id,actor_id,event_type,to_status,evidence_hash)
      VALUES ($1,$2,$3,$4,'allocation.assessed',$5,$6)`, [crypto.randomUUID(), id, tenantFor(req.user), req.user.id, assessment.status, assessment.assessmentHash]);
    await client.query('COMMIT'); return res.status(201).json({ workflow });
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); if (error.code === '42P01') return res.status(503).json({ error: 'Database migration is required', code: 'MIGRATION_REQUIRED' }); next(error); }
  finally { client.release(); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT w.*,COALESCE(json_agg(e ORDER BY e.created_at) FILTER (WHERE e.id IS NOT NULL),'[]') events
      FROM blood_allocation_workflows w LEFT JOIN blood_allocation_events e ON e.workflow_id=w.id
      WHERE w.id=$1 AND w.tenant_id=$2 GROUP BY w.id`, [req.params.id, tenantFor(req.user)]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Workflow not found' }); res.json({ workflow: result.rows[0] });
  } catch (error) { next(error); }
});

router.post('/:id/verify', async (req, res, next) => {
  const client = await pool.connect().catch(() => null); if (!client) return res.status(503).json({ error: 'Workflow store unavailable' });
  try {
    await client.query('BEGIN');
    const row = (await client.query('SELECT * FROM blood_allocation_workflows WHERE id=$1 AND tenant_id=$2 FOR UPDATE', [req.params.id, tenantFor(req.user)])).rows[0];
    if (!row) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Workflow not found' }); }
    let decision;
    try { decision = recordVerification(row.assessment, row.approvals, { id: req.user.id, role: req.user.role }); }
    catch (error) { await client.query('ROLLBACK'); return res.status(error.code === 'FORBIDDEN' ? 403 : 409).json({ error: error.message, code: error.code }); }
    const updated = (await client.query(`UPDATE blood_allocation_workflows SET approvals=$1,status=$2,version=version+1,updated_at=NOW()
      WHERE id=$3 AND version=$4 RETURNING *`, [decision.approvals, decision.status, row.id, row.version])).rows[0];
    await client.query(`INSERT INTO blood_allocation_events (id,workflow_id,tenant_id,actor_id,event_type,from_status,to_status,evidence_hash)
      VALUES ($1,$2,$3,$4,'allocation.verified',$5,$6,$7)`, [crypto.randomUUID(), row.id, row.tenant_id, req.user.id, row.status, decision.status, row.assessment.assessmentHash]);
    await client.query('COMMIT'); res.json({ workflow: updated });
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); next(error); }
  finally { client.release(); }
});
module.exports = router;
