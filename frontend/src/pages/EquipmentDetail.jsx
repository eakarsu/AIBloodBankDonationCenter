import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEquipmentItem, updateEquipmentItem, deleteEquipmentItem } from '../services/api';
import './Pages.css';

function EquipmentDetail() {
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
        const res = await getEquipmentItem(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load equipment'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateEquipmentItem(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteEquipmentItem(id);
      navigate('/equipment');
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Equipment not found</div></div>;

  const statusClass = item.status === 'current' ? 'active' : item.status === 'due_soon' ? 'warning' : item.status === 'overdue' ? 'danger' : 'active';

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/equipment')}>&larr; Back to Equipment</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{item.equipment_name}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Equipment Name</span><span className="value">{item.equipment_name}</span></div>
          <div className="detail-field"><span className="label">Type</span><span className="value">{item.equipment_type}</span></div>
          <div className="detail-field"><span className="label">Serial Number</span><span className="value">{item.serial_number}</span></div>
          <div className="detail-field"><span className="label">Location</span><span className="value">{item.location}</span></div>
          <div className="detail-field"><span className="label">Last Calibration</span><span className="value">{item.last_calibration}</span></div>
          <div className="detail-field"><span className="label">Next Calibration</span><span className="value">{item.next_calibration}</span></div>
          <div className="detail-field"><span className="label">Calibrated By</span><span className="value">{item.calibrated_by}</span></div>
          <div className="detail-field"><span className="label">Manufacturer</span><span className="value">{item.manufacturer}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.model}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${statusClass}`}>{item.status || 'current'}</span></span></div>
          <div className="detail-field"><span className="label">Maintenance Notes</span><span className="value">{item.maintenance_notes}</span></div>
          <div className="detail-field"><span className="label">Created</span><span className="value">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Equipment</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Equipment Name</label><input value={form.equipment_name || ''} onChange={e => setForm({...form, equipment_name: e.target.value})} /></div>
                <div className="form-group"><label>Equipment Type</label>
                  <select value={form.equipment_type || ''} onChange={e => setForm({...form, equipment_type: e.target.value})}>
                    <option value="">Select</option>
                    {['Centrifuge','Blood Mixer','Refrigerator','Freezer','Platelet Agitator','Hematology Analyzer','Blood Warmer','Temperature Monitor','Transport Container','Apheresis Machine'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Serial Number</label><input value={form.serial_number || ''} onChange={e => setForm({...form, serial_number: e.target.value})} /></div>
                <div className="form-group"><label>Location</label><input value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Last Calibration</label><input type="date" value={form.last_calibration || ''} onChange={e => setForm({...form, last_calibration: e.target.value})} /></div>
                <div className="form-group"><label>Next Calibration</label><input type="date" value={form.next_calibration || ''} onChange={e => setForm({...form, next_calibration: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Calibrated By</label><input value={form.calibrated_by || ''} onChange={e => setForm({...form, calibrated_by: e.target.value})} /></div>
                <div className="form-group"><label>Manufacturer</label><input value={form.manufacturer || ''} onChange={e => setForm({...form, manufacturer: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Model</label><input value={form.model || ''} onChange={e => setForm({...form, model: e.target.value})} /></div>
                <div className="form-group"><label></label></div>
              </div>
              <div className="form-group"><label>Maintenance Notes</label><textarea value={form.maintenance_notes || ''} onChange={e => setForm({...form, maintenance_notes: e.target.value})} /></div>
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
              <p>Are you sure you want to delete this equipment? This action cannot be undone.</p>
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

export default EquipmentDetail;
