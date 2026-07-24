import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStaffMember, updateStaffMember, deleteStaffMember } from '../services/api';
import './Pages.css';

function StaffDetail() {
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
        const res = await getStaffMember(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load staff member'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateStaffMember(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteStaffMember(id);
      navigate('/staff');
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Staff member not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/staff')}>&larr; Back to Staff</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{item.name}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Name</span><span className="value">{item.name}</span></div>
          <div className="detail-field"><span className="label">Role</span><span className="value">{item.role}</span></div>
          <div className="detail-field"><span className="label">Email</span><span className="value">{item.email}</span></div>
          <div className="detail-field"><span className="label">Phone</span><span className="value">{item.phone}</span></div>
          <div className="detail-field"><span className="label">Department</span><span className="value">{item.department}</span></div>
          <div className="detail-field"><span className="label">Supervisor</span><span className="value">{item.supervisor}</span></div>
          <div className="detail-field"><span className="label">Certification Type</span><span className="value">{item.certification_type}</span></div>
          <div className="detail-field"><span className="label">Certification Number</span><span className="value">{item.certification_number}</span></div>
          <div className="detail-field"><span className="label">Certification Date</span><span className="value">{item.certification_date}</span></div>
          <div className="detail-field"><span className="label">Expiration Date</span><span className="value">{item.expiration_date}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Created</span><span className="value">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Staff Member</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div className="form-group"><label>Role</label><input value={form.role || ''} onChange={e => setForm({...form, role: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Certification Type</label><input value={form.certification_type || ''} onChange={e => setForm({...form, certification_type: e.target.value})} /></div>
                <div className="form-group"><label>Certification Number</label><input value={form.certification_number || ''} onChange={e => setForm({...form, certification_number: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Certification Date</label><input type="date" value={form.certification_date || ''} onChange={e => setForm({...form, certification_date: e.target.value})} /></div>
                <div className="form-group"><label>Expiration Date</label><input type="date" value={form.expiration_date || ''} onChange={e => setForm({...form, expiration_date: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Department</label><input value={form.department || ''} onChange={e => setForm({...form, department: e.target.value})} /></div>
                <div className="form-group"><label>Supervisor</label><input value={form.supervisor || ''} onChange={e => setForm({...form, supervisor: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Status</label>
                  <select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="on_leave">On Leave</option>
                  </select>
                </div>
                <div className="form-group"><label></label></div>
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
              <p>Are you sure you want to delete this staff member? This action cannot be undone.</p>
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

export default StaffDetail;
