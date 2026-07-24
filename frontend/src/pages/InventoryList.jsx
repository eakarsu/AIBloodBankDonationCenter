import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInventory, createInventoryItem } from '../services/api';
import './Pages.css';

function InventoryList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ blood_type: '', rh_factor: '', product_type: '', units_available: '', unit_number: '', collection_date: '', expiration_date: '', storage_location: '', temperature: '', status: 'available' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const res = await getInventory(); const d = Array.isArray(res.data) ? res.data : []; setItems(d); setFiltered(d); } catch { setItems([]); setFiltered([]); } setLoading(false); };

  useEffect(() => { const q = search.toLowerCase(); setFiltered(items.filter(d => (d.blood_type || '').toLowerCase().includes(q) || (d.product_type || '').toLowerCase().includes(q) || (d.storage_location || '').toLowerCase().includes(q))); }, [search, items]);

  const handleCreate = async (e) => { e.preventDefault(); setError(''); try { await createInventoryItem(form); setShowModal(false); setForm({ blood_type: '', rh_factor: '', product_type: '', units_available: '', unit_number: '', collection_date: '', expiration_date: '', storage_location: '', temperature: '', status: 'available' }); fetchData(); } catch (err) { setError(err.response?.data?.error || 'Failed to create inventory item'); } };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u{1F4E6}'}</span> Inventory <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Item</button>
      </div>
      <div className="search-bar"><input placeholder="Search by blood type, product type, location..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">{'\u{1F4E6}'}</div><p>No inventory items found</p></div> : (
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>Blood Type</th><th>Rh Factor</th><th>Product Type</th><th>Units Available</th><th>Expiration Date</th><th>Storage Location</th><th>Status</th></tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id || d._id} onClick={() => navigate(`/inventory/${d.id || d._id}`)}>
              <td><span className="badge badge-active">{d.blood_type}</span></td>
              <td>{d.rh_factor}</td>
              <td><strong>{d.product_type}</strong></td>
              <td>{d.units_available}</td>
              <td>{d.expiration_date ? new Date(d.expiration_date).toLocaleDateString() : '-'}</td>
              <td>{d.storage_location}</td>
              <td><span className={`badge badge-${d.status || 'available'}`}>{d.status || 'available'}</span></td>
            </tr>))}</tbody></table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Add Inventory Item</h2>{error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group"><label>Blood Type</label>
                <select required value={form.blood_type} onChange={e => setForm({...form, blood_type: e.target.value})}>
                  <option value="">Select</option><option>A</option><option>B</option><option>AB</option><option>O</option>
                </select>
              </div>
              <div className="form-group"><label>Rh Factor</label>
                <select required value={form.rh_factor} onChange={e => setForm({...form, rh_factor: e.target.value})}>
                  <option value="">Select</option><option value="+">+</option><option value="-">-</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Product Type</label>
                <select required value={form.product_type} onChange={e => setForm({...form, product_type: e.target.value})}>
                  <option value="">Select</option><option>Whole Blood</option><option>Packed RBC</option><option>FFP</option><option>Platelets</option><option>Cryoprecipitate</option>
                </select>
              </div>
              <div className="form-group"><label>Units Available</label><input type="number" required value={form.units_available} onChange={e => setForm({...form, units_available: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Unit Number</label><input value={form.unit_number} onChange={e => setForm({...form, unit_number: e.target.value})} /></div>
              <div className="form-group"><label>Storage Location</label><input value={form.storage_location} onChange={e => setForm({...form, storage_location: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Collection Date</label><input type="date" value={form.collection_date} onChange={e => setForm({...form, collection_date: e.target.value})} /></div>
              <div className="form-group"><label>Expiration Date</label><input type="date" value={form.expiration_date} onChange={e => setForm({...form, expiration_date: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Temperature</label><input value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} /></div>
              <div className="form-group"><label>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="available">Available</option><option value="reserved">Reserved</option><option value="expired">Expired</option><option value="discarded">Discarded</option>
                </select>
              </div>
            </div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Item</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}

export default InventoryList;
