import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransportation, updateTransportation, deleteTransportation } from '../services/api';
import './Pages.css';

function TransportationDetail() {
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
        const res = await getTransportation(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load transportation'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateTransportation(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteTransportation(id);
      navigate('/transportation');
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Transportation not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/transportation')}>&larr; Back to Transportation</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>Transportation - {item.courier_name}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Courier Name</span><span className="value">{item.courier_name}</span></div>
          <div className="detail-field"><span className="label">Vehicle ID</span><span className="value">{item.vehicle_id}</span></div>
          <div className="detail-field"><span className="label">Departure Time</span><span className="value">{item.departure_time}</span></div>
          <div className="detail-field"><span className="label">Arrival Time</span><span className="value">{item.arrival_time}</span></div>
          <div className="detail-field"><span className="label">Origin</span><span className="value">{item.origin}</span></div>
          <div className="detail-field"><span className="label">Destination</span><span className="value">{item.destination}</span></div>
          <div className="detail-field"><span className="label">Temperature Log</span><span className="value">{item.temperature_log}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Chain of Custody</span><span className="value">{item.chain_of_custody}</span></div>
          <div className="detail-field"><span className="label">Order ID</span><span className="value">{item.order_id}</span></div>
          <div className="detail-field"><span className="label">Notes</span><span className="value">{item.notes}</span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Transportation</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Courier Name</label><input value={form.courier_name || ''} onChange={e => setForm({...form, courier_name: e.target.value})} /></div>
                <div className="form-group"><label>Vehicle ID</label><input value={form.vehicle_id || ''} onChange={e => setForm({...form, vehicle_id: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Departure Time</label><input type="datetime-local" value={form.departure_time || ''} onChange={e => setForm({...form, departure_time: e.target.value})} /></div>
                <div className="form-group"><label>Arrival Time</label><input type="datetime-local" value={form.arrival_time || ''} onChange={e => setForm({...form, arrival_time: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Origin</label><input value={form.origin || ''} onChange={e => setForm({...form, origin: e.target.value})} /></div>
                <div className="form-group"><label>Destination</label><input value={form.destination || ''} onChange={e => setForm({...form, destination: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Order ID</label><input value={form.order_id || ''} onChange={e => setForm({...form, order_id: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="pending">Pending</option><option value="in_transit">In Transit</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Temperature Log</label><textarea value={form.temperature_log || ''} onChange={e => setForm({...form, temperature_log: e.target.value})} /></div>
              <div className="form-group"><label>Chain of Custody</label><textarea value={form.chain_of_custody || ''} onChange={e => setForm({...form, chain_of_custody: e.target.value})} /></div>
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
              <p>Are you sure you want to delete this transportation record? This action cannot be undone.</p>
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

export default TransportationDetail;
