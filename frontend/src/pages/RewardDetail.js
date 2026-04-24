import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReward, updateReward, deleteReward } from '../services/api';
import './Pages.css';

function RewardDetail() {
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
        const res = await getReward(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load reward'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateReward(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteReward(id);
      navigate('/rewards');
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Reward not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/rewards')}>&larr; Back to Rewards</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{item.reward_type} - {item.milestone || 'Reward'}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Donor ID</span><span className="value">{item.donor_id}</span></div>
          <div className="detail-field"><span className="label">Reward Type</span><span className="value">{item.reward_type}</span></div>
          <div className="detail-field"><span className="label">Points</span><span className="value">{item.points}</span></div>
          <div className="detail-field"><span className="label">Milestone</span><span className="value">{item.milestone}</span></div>
          <div className="detail-field"><span className="label">Description</span><span className="value">{item.description}</span></div>
          <div className="detail-field"><span className="label">Earned Date</span><span className="value">{item.earned_date}</span></div>
          <div className="detail-field"><span className="label">Redeemed</span><span className="value">{item.redeemed ? 'Yes' : 'No'}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status || 'active'}`}>{item.status || 'active'}</span></span></div>
          <div className="detail-field"><span className="label">Created</span><span className="value">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Reward</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Donor ID</label><input value={form.donor_id || ''} onChange={e => setForm({...form, donor_id: e.target.value})} /></div>
                <div className="form-group"><label>Reward Type</label>
                  <select value={form.reward_type || ''} onChange={e => setForm({...form, reward_type: e.target.value})}>
                    <option value="">Select</option>
                    {['Points','Milestone Badge','Gift Card','Certificate','Referral Bonus'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Points</label><input type="number" value={form.points || ''} onChange={e => setForm({...form, points: e.target.value})} /></div>
                <div className="form-group"><label>Milestone</label><input value={form.milestone || ''} onChange={e => setForm({...form, milestone: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Earned Date</label><input type="date" value={form.earned_date || ''} onChange={e => setForm({...form, earned_date: e.target.value})} /></div>
                <div className="form-group"><label>Status</label><input value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} /></div>
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
              <p>Are you sure you want to delete this reward? This action cannot be undone.</p>
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

export default RewardDetail;
