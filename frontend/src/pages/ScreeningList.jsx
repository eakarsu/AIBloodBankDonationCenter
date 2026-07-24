import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScreenings, createScreening } from '../services/api';
import './Pages.css';

function ScreeningList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donor_id: '', screening_date: '', temperature: '', blood_pressure_systolic: '', blood_pressure_diastolic: '', hemoglobin: '', weight: '', pulse: '', status: 'pending', notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { const res = await getScreenings(); const d = Array.isArray(res.data) ? res.data : []; setItems(d); setFiltered(d); } catch { setItems([]); setFiltered([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(d => String(d.donor_id || '').includes(q) || (d.status || '').toLowerCase().includes(q)));
  }, [search, items]);

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try { await createScreening(form); setShowModal(false); fetchData(); } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u{1F3E5}'}</span> Health Screening <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Screening</button>
      </div>
      <div className="search-bar"><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? <div className="empty-state"><p>No screenings found</p></div> : (
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>ID</th><th>Donor ID</th><th>Date</th><th>Temp</th><th>BP</th><th>Hemoglobin</th><th>Status</th></tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id || d._id} onClick={() => navigate(`/screening/${d.id || d._id}`)}>
              <td>{d.id || d._id}</td><td>{d.donor_id}</td><td>{d.screening_date ? new Date(d.screening_date).toLocaleDateString() : '-'}</td>
              <td>{d.temperature || '-'}</td><td>{d.blood_pressure_systolic}/{d.blood_pressure_diastolic}</td><td>{d.hemoglobin || '-'}</td>
              <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
            </tr>
          ))}</tbody></table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Add Screening</h2>{error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group"><label>Donor ID</label><input required value={form.donor_id} onChange={e => setForm({...form, donor_id: e.target.value})} /></div>
              <div className="form-group"><label>Date</label><input type="date" required value={form.screening_date} onChange={e => setForm({...form, screening_date: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Temperature (F)</label><input type="number" step="0.1" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} /></div>
              <div className="form-group"><label>Hemoglobin (g/dL)</label><input type="number" step="0.1" value={form.hemoglobin} onChange={e => setForm({...form, hemoglobin: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>BP Systolic</label><input type="number" value={form.blood_pressure_systolic} onChange={e => setForm({...form, blood_pressure_systolic: e.target.value})} /></div>
              <div className="form-group"><label>BP Diastolic</label><input type="number" value={form.blood_pressure_diastolic} onChange={e => setForm({...form, blood_pressure_diastolic: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Weight (lbs)</label><input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
              <div className="form-group"><label>Pulse</label><input type="number" value={form.pulse} onChange={e => setForm({...form, pulse: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}

export default ScreeningList;
