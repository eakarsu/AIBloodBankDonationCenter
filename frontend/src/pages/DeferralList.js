import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeferrals, createDeferral } from '../services/api';
import './Pages.css';

function DeferralList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donor_id: '', deferral_type: 'temporary', reason: '', start_date: '', end_date: '', status: 'active', notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const res = await getDeferrals(); const d = Array.isArray(res.data) ? res.data : []; setItems(d); setFiltered(d); } catch { setItems([]); setFiltered([]); } setLoading(false); };

  useEffect(() => { const q = search.toLowerCase(); setFiltered(items.filter(d => (d.reason || '').toLowerCase().includes(q) || (d.deferral_type || '').toLowerCase().includes(q) || String(d.donor_id || '').includes(q))); }, [search, items]);

  const handleCreate = async (e) => { e.preventDefault(); setError(''); try { await createDeferral(form); setShowModal(false); fetchData(); } catch (err) { setError(err.response?.data?.error || 'Failed'); } };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u26A0\uFE0F'}</span> Deferrals <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Deferral</button>
      </div>
      <div className="search-bar"><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? <div className="empty-state"><p>No deferrals found</p></div> : (
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>ID</th><th>Donor ID</th><th>Type</th><th>Reason</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id || d._id} onClick={() => navigate(`/deferrals/${d.id || d._id}`)}>
              <td>{d.id || d._id}</td><td>{d.donor_id}</td><td>{d.deferral_type}</td><td>{d.reason}</td>
              <td>{d.start_date ? new Date(d.start_date).toLocaleDateString() : '-'}</td>
              <td>{d.end_date ? new Date(d.end_date).toLocaleDateString() : '-'}</td>
              <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
            </tr>))}</tbody></table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Add Deferral</h2>{error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group"><label>Donor ID</label><input required value={form.donor_id} onChange={e => setForm({...form, donor_id: e.target.value})} /></div>
              <div className="form-group"><label>Type</label><select value={form.deferral_type} onChange={e => setForm({...form, deferral_type: e.target.value})}><option value="temporary">Temporary</option><option value="permanent">Permanent</option></select></div>
            </div>
            <div className="form-group"><label>Reason</label><textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label>Start Date</label><input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
              <div className="form-group"><label>End Date</label><input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="active">Active</option><option value="expired">Expired</option><option value="cleared">Cleared</option></select></div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}

export default DeferralList;
