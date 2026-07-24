import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStaff, createStaffMember } from '../services/api';
import './Pages.css';

function StaffList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', certification_type: '', certification_number: '', certification_date: '', expiration_date: '', department: '', supervisor: '', status: 'active' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getStaff();
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setFiltered(data);
    } catch { setItems([]); setFiltered([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(d =>
      (d.name || '').toLowerCase().includes(q) ||
      (d.role || '').toLowerCase().includes(q) ||
      (d.department || '').toLowerCase().includes(q) ||
      (d.certification_type || '').toLowerCase().includes(q)
    ));
  }, [search, items]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createStaffMember(form);
      setShowModal(false);
      setForm({ name: '', role: '', email: '', phone: '', certification_type: '', certification_number: '', certification_date: '', expiration_date: '', department: '', supervisor: '', status: 'active' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create staff member'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\uD83D\uDC64'}</span> Staff <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Staff</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search by name, role, department, certification..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">{'\uD83D\uDC64'}</div><p>No staff found</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Role</th><th>Department</th><th>Certification Type</th><th>Cert Number</th><th>Expiration Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id || d._id} onClick={() => navigate(`/staff/${d.id || d._id}`)}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.role}</td>
                  <td>{d.department}</td>
                  <td>{d.certification_type}</td>
                  <td>{d.certification_number}</td>
                  <td>{d.expiration_date}</td>
                  <td><span className={`badge badge-${d.status || 'active'}`}>{d.status || 'active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Staff Member</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>Name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div className="form-group"><label>Role</label><input required value={form.role} onChange={e => setForm({...form, role: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Certification Type</label><input value={form.certification_type} onChange={e => setForm({...form, certification_type: e.target.value})} /></div>
                <div className="form-group"><label>Certification Number</label><input value={form.certification_number} onChange={e => setForm({...form, certification_number: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Certification Date</label><input type="date" value={form.certification_date} onChange={e => setForm({...form, certification_date: e.target.value})} /></div>
                <div className="form-group"><label>Expiration Date</label><input type="date" value={form.expiration_date} onChange={e => setForm({...form, expiration_date: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Department</label><input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                <div className="form-group"><label>Supervisor</label><input value={form.supervisor} onChange={e => setForm({...form, supervisor: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="on_leave">On Leave</option>
                  </select>
                </div>
                <div className="form-group"><label></label></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Staff Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffList;
