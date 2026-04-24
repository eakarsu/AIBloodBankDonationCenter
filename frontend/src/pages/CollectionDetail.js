import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCollection, updateCollection, deleteCollection } from '../services/api';
import './Pages.css';

function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { (async () => { try { const res = await getCollection(id); setItem(res.data); setForm(res.data); } catch { setError('Not found'); } setLoading(false); })(); }, [id]);
  const handleUpdate = async (e) => { e.preventDefault(); try { const res = await updateCollection(id, form); setItem(res.data); setEditing(false); } catch (err) { setError(err.response?.data?.error || 'Update failed'); } };
  const handleDelete = async () => { try { await deleteCollection(id); navigate('/collections'); } catch { setError('Delete failed'); } };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/collections')}>&larr; Back to Collections</div>
      <div className="detail-card">
        <div className="detail-header"><h2>Collection #{item.id || item._id}</h2>
          <div className="detail-actions"><button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button></div>
        </div>{error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Donation ID</span><span className="value">{item.donation_id}</span></div>
          <div className="detail-field"><span className="label">Phlebotomist ID</span><span className="value">{item.phlebotomist_id || '-'}</span></div>
          <div className="detail-field"><span className="label">Date</span><span className="value">{item.collection_date ? new Date(item.collection_date).toLocaleDateString() : '-'}</span></div>
          <div className="detail-field"><span className="label">Start Time</span><span className="value">{item.start_time || '-'}</span></div>
          <div className="detail-field"><span className="label">End Time</span><span className="value">{item.end_time || '-'}</span></div>
          <div className="detail-field"><span className="label">Volume (ml)</span><span className="value">{item.volume_collected || '-'}</span></div>
          <div className="detail-field"><span className="label">Bag Number</span><span className="value">{item.bag_number || '-'}</span></div>
          <div className="detail-field"><span className="label">Arm Used</span><span className="value">{item.arm_used || '-'}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Notes</span><span className="value">{item.notes || '-'}</span></div>
        </div>
      </div>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Edit Collection</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group"><label>Volume (ml)</label><input type="number" value={form.volume_collected || ''} onChange={e => setForm({...form, volume_collected: e.target.value})} /></div>
              <div className="form-group"><label>Bag Number</label><input value={form.bag_number || ''} onChange={e => setForm({...form, bag_number: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Arm Used</label><select value={form.arm_used || ''} onChange={e => setForm({...form, arm_used: e.target.value})}><option value="right">Right</option><option value="left">Left</option></select></div>
              <div className="form-group"><label>Status</label><select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}><option value="completed">Completed</option><option value="in-progress">In Progress</option><option value="failed">Failed</option></select></div>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
          </form>
        </div></div>
      )}
      {showConfirm && (<div className="modal-overlay" onClick={() => setShowConfirm(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="confirm-dialog"><p>Delete this collection?</p><div className="confirm-actions"><button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div></div></div></div>)}
    </div>
  );
}

export default CollectionDetail;
