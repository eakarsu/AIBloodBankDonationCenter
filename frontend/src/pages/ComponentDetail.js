import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComponent, updateComponent, deleteComponent } from '../services/api';
import './Pages.css';

function ComponentDetail() {
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
        const res = await getComponent(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load component'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateComponent(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteComponent(id);
      navigate('/components');
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Component not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/components')}>&larr; Back to Components</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{item.component_type} - Bag #{item.bag_number}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Component Type</span><span className="value"><strong>{item.component_type}</strong></span></div>
          <div className="detail-field"><span className="label">Bag Number</span><span className="value">{item.bag_number}</span></div>
          <div className="detail-field"><span className="label">Volume (ml)</span><span className="value">{item.volume_ml}</span></div>
          <div className="detail-field"><span className="label">Preparation Date</span><span className="value">{item.preparation_date ? new Date(item.preparation_date).toLocaleDateString() : '-'}</span></div>
          <div className="detail-field"><span className="label">Expiration Date</span><span className="value">{item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : '-'}</span></div>
          <div className="detail-field"><span className="label">Storage Temp</span><span className="value">{item.storage_temp}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Quality Check</span><span className="value">{item.quality_check}</span></div>
          <div className="detail-field"><span className="label">Processed By</span><span className="value">{item.processed_by}</span></div>
          <div className="detail-field"><span className="label">Collection ID</span><span className="value">{item.collection_id}</span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Component</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Component Type</label>
                  <select value={form.component_type || ''} onChange={e => setForm({...form, component_type: e.target.value})}>
                    <option value="">Select</option><option>Packed RBC</option><option>FFP</option><option>Platelets</option><option>Cryoprecipitate</option>
                  </select>
                </div>
                <div className="form-group"><label>Bag Number</label><input value={form.bag_number || ''} onChange={e => setForm({...form, bag_number: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Volume (ml)</label><input type="number" value={form.volume_ml || ''} onChange={e => setForm({...form, volume_ml: e.target.value})} /></div>
                <div className="form-group"><label>Storage Temp</label><input value={form.storage_temp || ''} onChange={e => setForm({...form, storage_temp: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Preparation Date</label><input type="date" value={form.preparation_date || ''} onChange={e => setForm({...form, preparation_date: e.target.value})} /></div>
                <div className="form-group"><label>Expiration Date</label><input type="date" value={form.expiration_date || ''} onChange={e => setForm({...form, expiration_date: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Processed By</label><input value={form.processed_by || ''} onChange={e => setForm({...form, processed_by: e.target.value})} /></div>
                <div className="form-group"><label>Collection ID</label><input value={form.collection_id || ''} onChange={e => setForm({...form, collection_id: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Quality Check</label><input value={form.quality_check || ''} onChange={e => setForm({...form, quality_check: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="available">Available</option><option value="reserved">Reserved</option><option value="expired">Expired</option><option value="discarded">Discarded</option>
                  </select>
                </div>
              </div>
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
              <p>Are you sure you want to delete this component? This action cannot be undone.</p>
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

export default ComponentDetail;
