import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInventoryItem, updateInventoryItem, deleteInventoryItem } from '../services/api';
import './Pages.css';

function InventoryDetail() {
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
        const res = await getInventoryItem(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load inventory item'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateInventoryItem(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteInventoryItem(id);
      navigate('/inventory');
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Inventory item not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/inventory')}>&larr; Back to Inventory</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{item.product_type} - {item.blood_type}{item.rh_factor}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Blood Type</span><span className="value"><span className="badge badge-active">{item.blood_type}</span></span></div>
          <div className="detail-field"><span className="label">Rh Factor</span><span className="value">{item.rh_factor}</span></div>
          <div className="detail-field"><span className="label">Product Type</span><span className="value"><strong>{item.product_type}</strong></span></div>
          <div className="detail-field"><span className="label">Units Available</span><span className="value">{item.units_available}</span></div>
          <div className="detail-field"><span className="label">Unit Number</span><span className="value">{item.unit_number}</span></div>
          <div className="detail-field"><span className="label">Collection Date</span><span className="value">{item.collection_date ? new Date(item.collection_date).toLocaleDateString() : '-'}</span></div>
          <div className="detail-field"><span className="label">Expiration Date</span><span className="value">{item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : '-'}</span></div>
          <div className="detail-field"><span className="label">Storage Location</span><span className="value">{item.storage_location}</span></div>
          <div className="detail-field"><span className="label">Temperature</span><span className="value">{item.temperature}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Inventory Item</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Blood Type</label>
                  <select value={form.blood_type || ''} onChange={e => setForm({...form, blood_type: e.target.value})}>
                    <option value="">Select</option><option>A</option><option>B</option><option>AB</option><option>O</option>
                  </select>
                </div>
                <div className="form-group"><label>Rh Factor</label>
                  <select value={form.rh_factor || ''} onChange={e => setForm({...form, rh_factor: e.target.value})}>
                    <option value="">Select</option><option value="+">+</option><option value="-">-</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Product Type</label>
                  <select value={form.product_type || ''} onChange={e => setForm({...form, product_type: e.target.value})}>
                    <option value="">Select</option><option>Whole Blood</option><option>Packed RBC</option><option>FFP</option><option>Platelets</option><option>Cryoprecipitate</option>
                  </select>
                </div>
                <div className="form-group"><label>Units Available</label><input type="number" value={form.units_available || ''} onChange={e => setForm({...form, units_available: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Unit Number</label><input value={form.unit_number || ''} onChange={e => setForm({...form, unit_number: e.target.value})} /></div>
                <div className="form-group"><label>Storage Location</label><input value={form.storage_location || ''} onChange={e => setForm({...form, storage_location: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Collection Date</label><input type="date" value={form.collection_date || ''} onChange={e => setForm({...form, collection_date: e.target.value})} /></div>
                <div className="form-group"><label>Expiration Date</label><input type="date" value={form.expiration_date || ''} onChange={e => setForm({...form, expiration_date: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Temperature</label><input value={form.temperature || ''} onChange={e => setForm({...form, temperature: e.target.value})} /></div>
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
              <p>Are you sure you want to delete this inventory item? This action cannot be undone.</p>
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

export default InventoryDetail;
