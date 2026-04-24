import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReaction, updateReaction, deleteReaction } from '../services/api';
import './Pages.css';

function ReactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getReaction(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load reaction'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateReaction(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteReaction(id);
      navigate('/reactions');
    } catch { setError('Delete failed'); }
  };

  const severityBadge = (severity) => {
    const colors = { mild: 'green', moderate: 'orange', severe: 'red' };
    const color = colors[severity] || 'gray';
    return <span className="badge" style={{ backgroundColor: color, color: '#fff' }}>{severity}</span>;
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Reaction not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/reactions')}>&larr; Back to Reactions</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>Reaction - {item.reaction_type}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Donor ID</span><span className="value">{item.donor_id}</span></div>
          <div className="detail-field"><span className="label">Collection ID</span><span className="value">{item.collection_id}</span></div>
          <div className="detail-field"><span className="label">Reaction Type</span><span className="value">{item.reaction_type}</span></div>
          <div className="detail-field"><span className="label">Severity</span><span className="value">{severityBadge(item.severity)}</span></div>
          <div className="detail-field"><span className="label">Symptoms</span><span className="value">{item.symptoms}</span></div>
          <div className="detail-field"><span className="label">Onset Time</span><span className="value">{item.onset_time}</span></div>
          <div className="detail-field"><span className="label">Treatment</span><span className="value">{item.treatment}</span></div>
          <div className="detail-field"><span className="label">Outcome</span><span className="value">{item.outcome}</span></div>
          <div className="detail-field"><span className="label">Reported By</span><span className="value">{item.reported_by}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Follow-up Required</span><span className="value">{item.follow_up_required ? 'Yes' : 'No'}</span></div>
          <div className="detail-field"><span className="label">Notes</span><span className="value">{item.notes}</span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Reaction</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Donor ID</label><input value={form.donor_id || ''} onChange={e => setForm({...form, donor_id: e.target.value})} /></div>
                <div className="form-group"><label>Collection ID</label><input value={form.collection_id || ''} onChange={e => setForm({...form, collection_id: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Reaction Type</label>
                  <select value={form.reaction_type || ''} onChange={e => setForm({...form, reaction_type: e.target.value})}>
                    <option value="">Select</option>
                    <option value="Vasovagal">Vasovagal</option>
                    <option value="Hematoma">Hematoma</option>
                    <option value="Citrate Reaction">Citrate Reaction</option>
                    <option value="Nerve Irritation">Nerve Irritation</option>
                    <option value="Allergic">Allergic</option>
                    <option value="Arterial Puncture">Arterial Puncture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Severity</label>
                  <select value={form.severity || ''} onChange={e => setForm({...form, severity: e.target.value})}>
                    <option value="">Select</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Symptoms</label><textarea value={form.symptoms || ''} onChange={e => setForm({...form, symptoms: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Onset Time</label><input type="datetime-local" value={form.onset_time || ''} onChange={e => setForm({...form, onset_time: e.target.value})} /></div>
                <div className="form-group"><label>Reported By</label><input value={form.reported_by || ''} onChange={e => setForm({...form, reported_by: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Treatment</label><textarea value={form.treatment || ''} onChange={e => setForm({...form, treatment: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Outcome</label><input value={form.outcome || ''} onChange={e => setForm({...form, outcome: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="active">Active</option><option value="resolved">Resolved</option><option value="monitoring">Monitoring</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label><input type="checkbox" checked={form.follow_up_required || false} onChange={e => setForm({...form, follow_up_required: e.target.checked})} /> Follow-up Required</label>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-dialog">
              <p>Are you sure you want to delete this reaction? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReactionDetail;
