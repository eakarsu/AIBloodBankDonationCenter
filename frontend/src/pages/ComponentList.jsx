import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComponents, createComponent } from '../services/api';
import './Pages.css';

function ComponentList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ collection_id: '', component_type: '', bag_number: '', volume_ml: '', preparation_date: '', expiration_date: '', storage_temp: '', processed_by: '', status: 'available' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const res = await getComponents(); const d = Array.isArray(res.data) ? res.data : []; setItems(d); setFiltered(d); } catch { setItems([]); setFiltered([]); } setLoading(false); };

  useEffect(() => { const q = search.toLowerCase(); setFiltered(items.filter(d => (d.component_type || '').toLowerCase().includes(q) || (d.bag_number || '').toLowerCase().includes(q))); }, [search, items]);

  const handleCreate = async (e) => { e.preventDefault(); setError(''); try { await createComponent(form); setShowModal(false); setForm({ collection_id: '', component_type: '', bag_number: '', volume_ml: '', preparation_date: '', expiration_date: '', storage_temp: '', processed_by: '', status: 'available' }); fetchData(); } catch (err) { setError(err.response?.data?.error || 'Failed to create component'); } };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u{1F9EA}'}</span> Components <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Component</button>
      </div>
      <div className="search-bar"><input placeholder="Search by component type, bag number..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">{'\u{1F9EA}'}</div><p>No components found</p></div> : (
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>Component Type</th><th>Bag Number</th><th>Volume (ml)</th><th>Preparation Date</th><th>Expiration Date</th><th>Status</th></tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id || d._id} onClick={() => navigate(`/components/${d.id || d._id}`)}>
              <td><strong>{d.component_type}</strong></td>
              <td>{d.bag_number}</td>
              <td>{d.volume_ml}</td>
              <td>{d.preparation_date ? new Date(d.preparation_date).toLocaleDateString() : '-'}</td>
              <td>{d.expiration_date ? new Date(d.expiration_date).toLocaleDateString() : '-'}</td>
              <td><span className={`badge badge-${d.status || 'available'}`}>{d.status || 'available'}</span></td>
            </tr>))}</tbody></table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Add New Component</h2>{error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group"><label>Collection ID</label><input required value={form.collection_id} onChange={e => setForm({...form, collection_id: e.target.value})} /></div>
              <div className="form-group"><label>Component Type</label>
                <select required value={form.component_type} onChange={e => setForm({...form, component_type: e.target.value})}>
                  <option value="">Select</option><option>Packed RBC</option><option>FFP</option><option>Platelets</option><option>Cryoprecipitate</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Bag Number</label><input required value={form.bag_number} onChange={e => setForm({...form, bag_number: e.target.value})} /></div>
              <div className="form-group"><label>Volume (ml)</label><input type="number" value={form.volume_ml} onChange={e => setForm({...form, volume_ml: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Preparation Date</label><input type="date" value={form.preparation_date} onChange={e => setForm({...form, preparation_date: e.target.value})} /></div>
              <div className="form-group"><label>Expiration Date</label><input type="date" value={form.expiration_date} onChange={e => setForm({...form, expiration_date: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Storage Temp</label><input value={form.storage_temp} onChange={e => setForm({...form, storage_temp: e.target.value})} /></div>
              <div className="form-group"><label>Processed By</label><input value={form.processed_by} onChange={e => setForm({...form, processed_by: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="available">Available</option><option value="reserved">Reserved</option><option value="expired">Expired</option><option value="discarded">Discarded</option>
              </select>
            </div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Component</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}

export default ComponentList;
