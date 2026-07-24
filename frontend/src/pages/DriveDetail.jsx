import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDrive, updateDrive, deleteDrive } from '../services/api';
import './Pages.css';

function DriveDetail() {
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
        const res = await getDrive(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load drive'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateDrive(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteDrive(id);
      navigate('/drives');
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Drive not found</div></div>;

  const collected = Number(item.collected_units) || 0;
  const goal = Number(item.goal_units) || 1;
  const progress = Math.min(Math.round((collected / goal) * 100), 100);

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/drives')}>&larr; Back to Drives</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{item.drive_name}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Drive Name</span><span className="value">{item.drive_name}</span></div>
          <div className="detail-field"><span className="label">Organization</span><span className="value">{item.organization}</span></div>
          <div className="detail-field"><span className="label">Location</span><span className="value">{item.location}</span></div>
          <div className="detail-field"><span className="label">Address</span><span className="value">{item.address}</span></div>
          <div className="detail-field"><span className="label">Drive Date</span><span className="value">{item.drive_date}</span></div>
          <div className="detail-field"><span className="label">Start Time</span><span className="value">{item.start_time}</span></div>
          <div className="detail-field"><span className="label">End Time</span><span className="value">{item.end_time}</span></div>
          <div className="detail-field"><span className="label">Coordinator</span><span className="value">{item.coordinator}</span></div>
          <div className="detail-field"><span className="label">Goal Units</span><span className="value">{item.goal_units}</span></div>
          <div className="detail-field"><span className="label">Collected Units</span><span className="value">{collected}</span></div>
          <div className="detail-field"><span className="label">Volunteers Needed</span><span className="value">{item.volunteers_needed}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Equipment List</span><span className="value">{item.equipment_list}</span></div>
          <div className="detail-field"><span className="label">Notes</span><span className="value">{item.notes}</span></div>
          <div className="detail-field"><span className="label">Created</span><span className="value">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</span></div>
        </div>
        <div className="detail-field" style={{marginTop: '1rem'}}>
          <span className="label">Progress ({collected}/{goal} units - {progress}%)</span>
          <div style={{width: '100%', backgroundColor: '#e0e0e0', borderRadius: '8px', overflow: 'hidden', marginTop: '0.5rem'}}>
            <div style={{width: `${progress}%`, height: '24px', backgroundColor: progress >= 100 ? '#27ae60' : progress >= 50 ? '#f39c12' : '#3498db', transition: 'width 0.3s ease', borderRadius: '8px'}}></div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Drive</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Drive Name</label><input value={form.drive_name || ''} onChange={e => setForm({...form, drive_name: e.target.value})} /></div>
                <div className="form-group"><label>Organization</label><input value={form.organization || ''} onChange={e => setForm({...form, organization: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location</label><input value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} /></div>
                <div className="form-group"><label>Address</label><input value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Drive Date</label><input type="date" value={form.drive_date || ''} onChange={e => setForm({...form, drive_date: e.target.value})} /></div>
                <div className="form-group"><label>Coordinator</label><input value={form.coordinator || ''} onChange={e => setForm({...form, coordinator: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start Time</label><input type="time" value={form.start_time || ''} onChange={e => setForm({...form, start_time: e.target.value})} /></div>
                <div className="form-group"><label>End Time</label><input type="time" value={form.end_time || ''} onChange={e => setForm({...form, end_time: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Goal Units</label><input type="number" value={form.goal_units || ''} onChange={e => setForm({...form, goal_units: e.target.value})} /></div>
                <div className="form-group"><label>Collected Units</label><input type="number" value={form.collected_units || ''} onChange={e => setForm({...form, collected_units: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Volunteers Needed</label><input type="number" value={form.volunteers_needed || ''} onChange={e => setForm({...form, volunteers_needed: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="planned">Planned</option><option value="confirmed">Confirmed</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Equipment List</label><textarea value={form.equipment_list || ''} onChange={e => setForm({...form, equipment_list: e.target.value})} /></div>
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
              <p>Are you sure you want to delete this drive? This action cannot be undone.</p>
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

export default DriveDetail;
