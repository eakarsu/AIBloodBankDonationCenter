import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDonation, updateDonation, deleteDonation } from '../services/api';
import './Pages.css';

function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => { try { const res = await getDonation(id); setItem(res.data); setForm(res.data); } catch { setError('Not found'); } setLoading(false); })();
  }, [id]);

  const handleUpdate = async (e) => { e.preventDefault(); try { const res = await updateDonation(id, form); setItem(res.data); setEditing(false); } catch (err) { setError(err.response?.data?.error || 'Update failed'); } };
  const handleDelete = async () => { try { await deleteDonation(id); navigate('/donations'); } catch { setError('Delete failed'); } };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/donations')}>&larr; Back to Donations</div>
      <div className="detail-card">
        <div className="detail-header"><h2>Donation #{item.id || item._id}</h2>
          <div className="detail-actions"><button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button></div>
        </div>{error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Donor ID</span><span className="value">{item.donor_id}</span></div>
          <div className="detail-field"><span className="label">Date</span><span className="value">{item.donation_date ? new Date(item.donation_date).toLocaleDateString() : '-'}</span></div>
          <div className="detail-field"><span className="label">Type</span><span className="value">{item.donation_type}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Volume (ml)</span><span className="value">{item.volume_ml || '-'}</span></div>
          <div className="detail-field"><span className="label">Notes</span><span className="value">{item.notes || '-'}</span></div>
        </div>
      </div>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Edit Donation</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group"><label>Donor ID</label><input value={form.donor_id || ''} onChange={e => setForm({...form, donor_id: e.target.value})} /></div>
              <div className="form-group"><label>Date</label><input type="date" value={form.donation_date || ''} onChange={e => setForm({...form, donation_date: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Type</label><select value={form.donation_type || ''} onChange={e => setForm({...form, donation_type: e.target.value})}><option>Whole Blood</option><option>Platelets</option><option>Plasma</option><option>Double Red Cells</option></select></div>
              <div className="form-group"><label>Status</label><select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
          </form>
        </div></div>
      )}
      {showConfirm && (<div className="modal-overlay" onClick={() => setShowConfirm(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="confirm-dialog"><p>Delete this donation?</p><div className="confirm-actions"><button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div></div></div></div>)}
    </div>
  );
}

export default DonationDetail;
