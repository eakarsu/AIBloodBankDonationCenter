import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBloodTypings, createBloodTyping } from '../services/api';
import './Pages.css';

function BloodTypingList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donation_id: '', abo_type: '', rh_factor: '', antibody_screen: '', crossmatch_result: '', hiv_test: 'negative', hbv_test: 'negative', hcv_test: 'negative', syphilis_test: 'negative', testing_date: '', technician_id: '', status: 'pending', notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const res = await getBloodTypings(); const d = Array.isArray(res.data) ? res.data : []; setItems(d); setFiltered(d); } catch { setItems([]); setFiltered([]); } setLoading(false); };

  useEffect(() => { const q = search.toLowerCase(); setFiltered(items.filter(d => (d.abo_type || '').toLowerCase().includes(q) || (d.rh_factor || '').toLowerCase().includes(q) || String(d.donation_id || '').includes(q))); }, [search, items]);

  const handleCreate = async (e) => { e.preventDefault(); setError(''); try { await createBloodTyping(form); setShowModal(false); fetchData(); } catch (err) { setError(err.response?.data?.error || 'Failed'); } };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u{1F52C}'}</span> Blood Typing & Testing <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Test</button>
      </div>
      <div className="search-bar"><input placeholder="Search by blood type..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? <div className="empty-state"><p>No tests found</p></div> : (
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>ID</th><th>Donation ID</th><th>ABO</th><th>Rh</th><th>HIV</th><th>HBV</th><th>HCV</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id || d._id} onClick={() => navigate(`/bloodtyping/${d.id || d._id}`)}>
              <td>{d.id || d._id}</td><td>{d.donation_id}</td><td><strong>{d.abo_type}</strong></td><td>{d.rh_factor}</td>
              <td><span className={`badge badge-${d.hiv_test === 'negative' ? 'positive' : 'negative'}`}>{d.hiv_test}</span></td>
              <td><span className={`badge badge-${d.hbv_test === 'negative' ? 'positive' : 'negative'}`}>{d.hbv_test}</span></td>
              <td><span className={`badge badge-${d.hcv_test === 'negative' ? 'positive' : 'negative'}`}>{d.hcv_test}</span></td>
              <td>{d.testing_date ? new Date(d.testing_date).toLocaleDateString() : '-'}</td>
              <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
            </tr>))}</tbody></table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Add Blood Typing Test</h2>{error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group"><label>Donation ID</label><input required value={form.donation_id} onChange={e => setForm({...form, donation_id: e.target.value})} /></div>
              <div className="form-group"><label>Testing Date</label><input type="date" value={form.testing_date} onChange={e => setForm({...form, testing_date: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>ABO Type</label><select value={form.abo_type} onChange={e => setForm({...form, abo_type: e.target.value})}><option value="">Select</option><option>A</option><option>B</option><option>AB</option><option>O</option></select></div>
              <div className="form-group"><label>Rh Factor</label><select value={form.rh_factor} onChange={e => setForm({...form, rh_factor: e.target.value})}><option value="">Select</option><option value="positive">Positive</option><option value="negative">Negative</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>HIV Test</label><select value={form.hiv_test} onChange={e => setForm({...form, hiv_test: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select></div>
              <div className="form-group"><label>HBV Test</label><select value={form.hbv_test} onChange={e => setForm({...form, hbv_test: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>HCV Test</label><select value={form.hcv_test} onChange={e => setForm({...form, hcv_test: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select></div>
              <div className="form-group"><label>Syphilis Test</label><select value={form.syphilis_test} onChange={e => setForm({...form, syphilis_test: e.target.value})}><option value="negative">Negative</option><option value="positive">Positive</option></select></div>
            </div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="pending">Pending</option><option value="completed">Completed</option></select></div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}

export default BloodTypingList;
