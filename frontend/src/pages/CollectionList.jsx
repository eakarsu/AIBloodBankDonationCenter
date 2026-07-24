import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCollections, createCollection } from '../services/api';
import './Pages.css';

function CollectionList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donation_id: '', phlebotomist_id: '', collection_date: '', start_time: '', end_time: '', volume_collected: '', bag_number: '', arm_used: 'right', status: 'completed', notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const res = await getCollections(); const d = Array.isArray(res.data) ? res.data : []; setItems(d); setFiltered(d); } catch { setItems([]); setFiltered([]); } setLoading(false); };

  useEffect(() => { const q = search.toLowerCase(); setFiltered(items.filter(d => (d.bag_number || '').toLowerCase().includes(q) || (d.status || '').toLowerCase().includes(q) || String(d.donation_id || '').includes(q))); }, [search, items]);

  const handleCreate = async (e) => { e.preventDefault(); setError(''); try { await createCollection(form); setShowModal(false); fetchData(); } catch (err) { setError(err.response?.data?.error || 'Failed'); } };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u{1F489}'}</span> Collections <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Collection</button>
      </div>
      <div className="search-bar"><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? <div className="empty-state"><p>No collections found</p></div> : (
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>ID</th><th>Donation ID</th><th>Date</th><th>Volume (ml)</th><th>Bag #</th><th>Arm</th><th>Status</th></tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id || d._id} onClick={() => navigate(`/collections/${d.id || d._id}`)}>
              <td>{d.id || d._id}</td><td>{d.donation_id}</td><td>{d.collection_date ? new Date(d.collection_date).toLocaleDateString() : '-'}</td>
              <td>{d.volume_collected || '-'}</td><td>{d.bag_number || '-'}</td><td>{d.arm_used}</td>
              <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
            </tr>))}</tbody></table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Add Collection</h2>{error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group"><label>Donation ID</label><input required value={form.donation_id} onChange={e => setForm({...form, donation_id: e.target.value})} /></div>
              <div className="form-group"><label>Phlebotomist ID</label><input value={form.phlebotomist_id} onChange={e => setForm({...form, phlebotomist_id: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Date</label><input type="date" value={form.collection_date} onChange={e => setForm({...form, collection_date: e.target.value})} /></div>
              <div className="form-group"><label>Volume (ml)</label><input type="number" value={form.volume_collected} onChange={e => setForm({...form, volume_collected: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Bag Number</label><input value={form.bag_number} onChange={e => setForm({...form, bag_number: e.target.value})} /></div>
              <div className="form-group"><label>Arm Used</label><select value={form.arm_used} onChange={e => setForm({...form, arm_used: e.target.value})}><option value="right">Right</option><option value="left">Left</option></select></div>
            </div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="completed">Completed</option><option value="in-progress">In Progress</option><option value="failed">Failed</option></select></div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}

export default CollectionList;
