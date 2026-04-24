import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDonor, updateDonor, deleteDonor } from '../services/api';
import './Pages.css';

function DonorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDonor(id);
        setDonor(res.data);
        setForm(res.data);
      } catch { setError('Failed to load donor'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateDonor(id, form);
      setDonor(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteDonor(id);
      navigate('/donors');
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!donor) return <div className="page-container"><div className="error-message">Donor not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/donors')}>&larr; Back to Donors</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>{donor.first_name} {donor.last_name}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Email</span><span className="value">{donor.email}</span></div>
          <div className="detail-field"><span className="label">Phone</span><span className="value">{donor.phone}</span></div>
          <div className="detail-field"><span className="label">Blood Type</span><span className="value"><span className="badge badge-active">{donor.blood_type}</span></span></div>
          <div className="detail-field"><span className="label">Gender</span><span className="value">{donor.gender}</span></div>
          <div className="detail-field"><span className="label">Date of Birth</span><span className="value">{donor.date_of_birth}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${donor.status}`}>{donor.status}</span></span></div>
          <div className="detail-field"><span className="label">Address</span><span className="value">{donor.address}</span></div>
          <div className="detail-field"><span className="label">Created</span><span className="value">{donor.created_at ? new Date(donor.created_at).toLocaleDateString() : '-'}</span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Donor</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input value={form.first_name || ''} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
                <div className="form-group"><label>Last Name</label><input value={form.last_name || ''} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Blood Type</label>
                  <select value={form.blood_type || ''} onChange={e => setForm({...form, blood_type: e.target.value})}>
                    <option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Gender</label>
                  <select value={form.gender || ''} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Date of Birth</label><input type="date" value={form.date_of_birth || ''} onChange={e => setForm({...form, date_of_birth: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="deferred">Deferred</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Address</label><textarea value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} /></div>
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
              <p>Are you sure you want to delete this donor? This action cannot be undone.</p>
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

export default DonorDetail;
