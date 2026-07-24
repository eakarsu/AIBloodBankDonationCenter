import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDonors, createDonor } from '../services/api';
import './Pages.css';

function DonorList() {
  const [donors, setDonors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', blood_type: '', date_of_birth: '', gender: '', address: '', status: 'active' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getDonors();
      const data = Array.isArray(res.data) ? res.data : [];
      setDonors(data);
      setFiltered(data);
    } catch { setDonors([]); setFiltered([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(donors.filter(d =>
      (d.first_name || '').toLowerCase().includes(q) ||
      (d.last_name || '').toLowerCase().includes(q) ||
      (d.email || '').toLowerCase().includes(q) ||
      (d.blood_type || '').toLowerCase().includes(q)
    ));
  }, [search, donors]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createDonor(form);
      setShowModal(false);
      setForm({ first_name: '', last_name: '', email: '', phone: '', blood_type: '', date_of_birth: '', gender: '', address: '', status: 'active' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create donor'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u{1FA78}'}</span> Donors <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Donor</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search by name, email, blood type..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">{'\u{1FA78}'}</div><p>No donors found</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Blood Type</th><th>Gender</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id || d._id} onClick={() => navigate(`/donors/${d.id || d._id}`)}>
                  <td><strong>{d.first_name} {d.last_name}</strong></td>
                  <td>{d.email}</td>
                  <td>{d.phone}</td>
                  <td><span className="badge badge-active">{d.blood_type}</span></td>
                  <td>{d.gender}</td>
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
            <h2>Add New Donor</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
                <div className="form-group"><label>Last Name</label><input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Blood Type</label>
                  <select value={form.blood_type} onChange={e => setForm({...form, blood_type: e.target.value})}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="deferred">Deferred</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Donor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorList;
