import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, updateOrder, deleteOrder } from '../services/api';
import './Pages.css';

function OrderDetail() {
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
        const res = await getOrder(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load order'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateOrder(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(id);
      navigate('/orders');
    } catch { setError('Delete failed'); }
  };

  const priorityBadge = (priority) => {
    const colors = { routine: 'blue', urgent: 'orange', emergency: 'red' };
    const color = colors[priority] || 'blue';
    return <span className="badge" style={{ backgroundColor: color, color: '#fff' }}>{priority}</span>;
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Order not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/orders')}>&larr; Back to Orders</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>Order - {item.hospital_name}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Hospital Name</span><span className="value">{item.hospital_name}</span></div>
          <div className="detail-field"><span className="label">Hospital Contact</span><span className="value">{item.hospital_contact}</span></div>
          <div className="detail-field"><span className="label">Blood Type</span><span className="value"><span className="badge badge-active">{item.blood_type}</span></span></div>
          <div className="detail-field"><span className="label">Rh Factor</span><span className="value">{item.rh_factor}</span></div>
          <div className="detail-field"><span className="label">Product Type</span><span className="value">{item.product_type}</span></div>
          <div className="detail-field"><span className="label">Units Requested</span><span className="value">{item.units_requested}</span></div>
          <div className="detail-field"><span className="label">Units Fulfilled</span><span className="value">{item.units_fulfilled}</span></div>
          <div className="detail-field"><span className="label">Priority</span><span className="value">{priorityBadge(item.priority)}</span></div>
          <div className="detail-field"><span className="label">Order Date</span><span className="value">{item.order_date}</span></div>
          <div className="detail-field"><span className="label">Needed By</span><span className="value">{item.needed_by}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Notes</span><span className="value">{item.notes}</span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Order</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Hospital Name</label><input value={form.hospital_name || ''} onChange={e => setForm({...form, hospital_name: e.target.value})} /></div>
                <div className="form-group"><label>Hospital Contact</label><input value={form.hospital_contact || ''} onChange={e => setForm({...form, hospital_contact: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Blood Type</label>
                  <select value={form.blood_type || ''} onChange={e => setForm({...form, blood_type: e.target.value})}>
                    <option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Rh Factor</label>
                  <select value={form.rh_factor || ''} onChange={e => setForm({...form, rh_factor: e.target.value})}>
                    <option value="">Select</option><option value="positive">Positive</option><option value="negative">Negative</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Product Type</label><input value={form.product_type || ''} onChange={e => setForm({...form, product_type: e.target.value})} /></div>
                <div className="form-group"><label>Units Requested</label><input type="number" value={form.units_requested || ''} onChange={e => setForm({...form, units_requested: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Units Fulfilled</label><input type="number" value={form.units_fulfilled || ''} onChange={e => setForm({...form, units_fulfilled: e.target.value})} /></div>
                <div className="form-group"><label>Priority</label>
                  <select value={form.priority || ''} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option value="">Select</option><option value="routine">Routine</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Order Date</label><input type="date" value={form.order_date || ''} onChange={e => setForm({...form, order_date: e.target.value})} /></div>
                <div className="form-group"><label>Needed By</label><input type="date" value={form.needed_by || ''} onChange={e => setForm({...form, needed_by: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Status</label>
                  <select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="pending">Pending</option><option value="processing">Processing</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
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
              <p>Are you sure you want to delete this order? This action cannot be undone.</p>
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

export default OrderDetail;
