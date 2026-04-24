import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeferral, updateDeferral, deleteDeferral } from '../services/api';
import './Pages.css';

function DeferralDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { (async () => { try { const res = await getDeferral(id); setItem(res.data); setForm(res.data); } catch { setError('Not found'); } setLoading(false); })(); }, [id]);
  const handleUpdate = async (e) => { e.preventDefault(); try { const res = await updateDeferral(id, form); setItem(res.data); setEditing(false); } catch (err) { setError(err.response?.data?.error || 'Update failed'); } };
  const handleDelete = async () => { try { await deleteDeferral(id); navigate('/deferrals'); } catch { setError('Delete failed'); } };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/deferrals')}>&larr; Back to Deferrals</div>
      <div className="detail-card">
        <div className="detail-header"><h2>Deferral #{item.id || item._id}</h2>
          <div className="detail-actions"><button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button></div>
        </div>{error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Donor ID</span><span className="value">{item.donor_id}</span></div>
          <div className="detail-field"><span className="label">Type</span><span className="value">{item.deferral_type}</span></div>
          <div className="detail-field"><span className="label">Reason</span><span className="value">{item.reason}</span></div>
          <div className="detail-field"><span className="label">Start Date</span><span className="value">{item.start_date ? new Date(item.start_date).toLocaleDateString() : '-'}</span></div>
          <div className="detail-field"><span className="label">End Date</span><span className="value">{item.end_date ? new Date(item.end_date).toLocaleDateString() : '-'}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Notes</span><span className="value">{item.notes || '-'}</span></div>
        </div>
      </div>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Edit Deferral</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group"><label>Type</label><select value={form.deferral_type || ''} onChange={e => setForm({...form, deferral_type: e.target.value})}><option value="temporary">Temporary</option><option value="permanent">Permanent</option></select></div>
              <div className="form-group"><label>Status</label><select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}><option value="active">Active</option><option value="expired">Expired</option><option value="cleared">Cleared</option></select></div>
            </div>
            <div className="form-group"><label>Reason</label><textarea value={form.reason || ''} onChange={e => setForm({...form, reason: e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label>Start Date</label><input type="date" value={form.start_date || ''} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
              <div className="form-group"><label>End Date</label><input type="date" value={form.end_date || ''} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
          </form>
        </div></div>
      )}
      {showConfirm && (<div className="modal-overlay" onClick={() => setShowConfirm(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="confirm-dialog"><p>Delete this deferral?</p><div className="confirm-actions"><button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div></div></div></div>)}
    </div>
  );
}

export default DeferralDetail;
