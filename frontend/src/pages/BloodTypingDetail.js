import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBloodTyping, updateBloodTyping, deleteBloodTyping } from '../services/api';
import './Pages.css';

function BloodTypingDetail() {
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
        const res = await getBloodTyping(id);
        setItem(res.data);
        setForm(res.data);
      } catch { setError('Failed to load blood typing record'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateBloodTyping(id, form);
      setItem(res.data);
      setEditing(false);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteBloodTyping(id);
      navigate('/bloodtyping');
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!item) return <div className="page-container"><div className="error-message">Blood typing record not found</div></div>;

  return (
    <div className="page-container">
      <div className="back-link" onClick={() => navigate('/bloodtyping')}>&larr; Back to Blood Typing</div>
      <div className="detail-card">
        <div className="detail-header">
          <h2>Blood Typing - Bag #{item.bag_number}</h2>
          <div className="detail-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>Delete</button>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Bag Number</span><span className="value">{item.bag_number}</span></div>
          <div className="detail-field"><span className="label">ABO Type</span><span className="value"><span className="badge badge-active">{item.abo_type}</span></span></div>
          <div className="detail-field"><span className="label">Rh Type</span><span className="value">{item.rh_type}</span></div>
          <div className="detail-field"><span className="label">Antibody Screen</span><span className="value">{item.antibody_screen}</span></div>
          <div className="detail-field"><span className="label">HIV Test</span><span className="value"><span className={`badge badge-${item.hiv_test === 'negative' ? 'positive' : 'negative'}`}>{item.hiv_test}</span></span></div>
          <div className="detail-field"><span className="label">Hepatitis B</span><span className="value"><span className={`badge badge-${item.hepatitis_b === 'negative' ? 'positive' : 'negative'}`}>{item.hepatitis_b}</span></span></div>
          <div className="detail-field"><span className="label">Hepatitis C</span><span className="value"><span className={`badge badge-${item.hepatitis_c === 'negative' ? 'positive' : 'negative'}`}>{item.hepatitis_c}</span></span></div>
          <div className="detail-field"><span className="label">Syphilis Test</span><span className="value"><span className={`badge badge-${item.syphilis_test === 'negative' ? 'positive' : 'negative'}`}>{item.syphilis_test}</span></span></div>
          <div className="detail-field"><span className="label">Zika Test</span><span className="value"><span className={`badge badge-${item.zika_test === 'negative' ? 'positive' : 'negative'}`}>{item.zika_test}</span></span></div>
          <div className="detail-field"><span className="label">WNV Test</span><span className="value"><span className={`badge badge-${item.wnv_test === 'negative' ? 'positive' : 'negative'}`}>{item.wnv_test}</span></span></div>
          <div className="detail-field"><span className="label">Test Date</span><span className="value">{item.test_date ? new Date(item.test_date).toLocaleDateString() : '-'}</span></div>
          <div className="detail-field"><span className="label">Tested By</span><span className="value">{item.tested_by}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status}`}>{item.status}</span></span></div>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Blood Typing</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group"><label>Bag Number</label><input value={form.bag_number || ''} onChange={e => setForm({...form, bag_number: e.target.value})} /></div>
                <div className="form-group"><label>ABO Type</label>
                  <select value={form.abo_type || ''} onChange={e => setForm({...form, abo_type: e.target.value})}>
                    <option value="">Select</option><option>A</option><option>B</option><option>AB</option><option>O</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Rh Type</label>
                  <select value={form.rh_type || ''} onChange={e => setForm({...form, rh_type: e.target.value})}>
                    <option value="">Select</option><option value="+">+</option><option value="-">-</option>
                  </select>
                </div>
                <div className="form-group"><label>Antibody Screen</label><input value={form.antibody_screen || ''} onChange={e => setForm({...form, antibody_screen: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>HIV Test</label>
                  <select value={form.hiv_test || ''} onChange={e => setForm({...form, hiv_test: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select>
                </div>
                <div className="form-group"><label>Hepatitis B</label>
                  <select value={form.hepatitis_b || ''} onChange={e => setForm({...form, hepatitis_b: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Hepatitis C</label>
                  <select value={form.hepatitis_c || ''} onChange={e => setForm({...form, hepatitis_c: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select>
                </div>
                <div className="form-group"><label>Syphilis Test</label>
                  <select value={form.syphilis_test || ''} onChange={e => setForm({...form, syphilis_test: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Zika Test</label>
                  <select value={form.zika_test || ''} onChange={e => setForm({...form, zika_test: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select>
                </div>
                <div className="form-group"><label>WNV Test</label>
                  <select value={form.wnv_test || ''} onChange={e => setForm({...form, wnv_test: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Test Date</label><input type="date" value={form.test_date || ''} onChange={e => setForm({...form, test_date: e.target.value})} /></div>
                <div className="form-group"><label>Tested By</label><input value={form.tested_by || ''} onChange={e => setForm({...form, tested_by: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Status</label>
                <select value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="pending">Pending</option><option value="completed">Completed</option>
                </select>
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
              <p>Are you sure you want to delete this blood typing record? This action cannot be undone.</p>
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

export default BloodTypingDetail;
