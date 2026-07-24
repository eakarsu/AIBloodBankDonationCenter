import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDonations, createDonation } from '../services/api';
import './Pages.css';

function DonationList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donor_id: '', donation_date: '', donation_type: 'Whole Blood', status: 'scheduled', center_id: '', notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { const res = await getDonations(); const d = Array.isArray(res.data) ? res.data : []; setItems(d); setFiltered(d); } catch { setItems([]); setFiltered([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(d => (d.donation_type || '').toLowerCase().includes(q) || (d.status || '').toLowerCase().includes(q) || String(d.donor_id || '').includes(q)));
  }, [search, items]);

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try { await createDonation(form); setShowModal(false); fetchData(); setForm({ donor_id: '', donation_date: '', donation_type: 'Whole Blood', status: 'scheduled', center_id: '', notes: '' }); }
    catch (err) { setError(err.response?.data?.error || 'Failed to create'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u{1F4C5}'}</span> Donations <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Donation</button>
      </div>
      <div className="search-bar"><input placeholder="Search donations..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? <div className="empty-state"><p>No donations found</p></div> : (
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>ID</th><th>Donor ID</th><th>Date</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id || d._id} onClick={() => navigate(`/donations/${d.id || d._id}`)}>
              <td>{d.id || d._id}</td><td>{d.donor_id}</td><td>{d.donation_date ? new Date(d.donation_date).toLocaleDateString() : '-'}</td>
              <td>{d.donation_type}</td><td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
            </tr>
          ))}</tbody></table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Add New Donation</h2>{error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group"><label>Donor ID</label><input required value={form.donor_id} onChange={e => setForm({...form, donor_id: e.target.value})} /></div>
              <div className="form-group"><label>Date</label><input type="date" required value={form.donation_date} onChange={e => setForm({...form, donation_date: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Type</label><select value={form.donation_type} onChange={e => setForm({...form, donation_type: e.target.value})}>
                <option>Whole Blood</option><option>Platelets</option><option>Plasma</option><option>Double Red Cells</option>
              </select></div>
              <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select></div>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}

export default DonationList;
