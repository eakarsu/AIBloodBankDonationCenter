import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, createOrder } from '../services/api';
import './Pages.css';

function OrderList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ hospital_name: '', hospital_contact: '', blood_type: '', rh_factor: '', product_type: '', units_requested: '', priority: 'routine', needed_by: '', notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const res = await getOrders(); const d = Array.isArray(res.data) ? res.data : []; setItems(d); setFiltered(d); } catch { setItems([]); setFiltered([]); } setLoading(false); };

  useEffect(() => { const q = search.toLowerCase(); setFiltered(items.filter(d => (d.hospital_name || '').toLowerCase().includes(q) || (d.blood_type || '').toLowerCase().includes(q))); }, [search, items]);

  const handleCreate = async (e) => { e.preventDefault(); setError(''); try { await createOrder(form); setShowModal(false); setForm({ hospital_name: '', hospital_contact: '', blood_type: '', rh_factor: '', product_type: '', units_requested: '', priority: 'routine', needed_by: '', notes: '' }); fetchData(); } catch (err) { setError(err.response?.data?.error || 'Failed to create order'); } };

  const priorityBadge = (priority) => {
    const colors = { routine: 'blue', urgent: 'orange', emergency: 'red' };
    return <span className={`badge`} style={{ backgroundColor: colors[priority] || '#999', color: '#fff' }}>{priority}</span>;
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u{1F4CB}'}</span> Orders <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Order</button>
      </div>
      <div className="search-bar"><input placeholder="Search by hospital, blood type..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">{'\u{1F4CB}'}</div><p>No orders found</p></div> : (
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>Hospital</th><th>Blood Type</th><th>Product Type</th><th>Units Requested</th><th>Units Fulfilled</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>{filtered.map(d => (
            <tr key={d.id || d._id} onClick={() => navigate(`/orders/${d.id || d._id}`)}>
              <td><strong>{d.hospital_name}</strong></td>
              <td><span className="badge badge-active">{d.blood_type}</span></td>
              <td>{d.product_type}</td>
              <td>{d.units_requested}</td>
              <td>{d.units_fulfilled}</td>
              <td>{priorityBadge(d.priority)}</td>
              <td><span className={`badge badge-${d.status || 'pending'}`}>{d.status || 'pending'}</span></td>
            </tr>))}</tbody></table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2>Add New Order</h2>{error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group"><label>Hospital Name</label><input required value={form.hospital_name} onChange={e => setForm({...form, hospital_name: e.target.value})} /></div>
              <div className="form-group"><label>Hospital Contact</label><input value={form.hospital_contact} onChange={e => setForm({...form, hospital_contact: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Blood Type</label>
                <select required value={form.blood_type} onChange={e => setForm({...form, blood_type: e.target.value})}>
                  <option value="">Select</option><option>A</option><option>B</option><option>AB</option><option>O</option>
                </select>
              </div>
              <div className="form-group"><label>Rh Factor</label>
                <select value={form.rh_factor} onChange={e => setForm({...form, rh_factor: e.target.value})}>
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
              <div className="form-group"><label>Units Requested</label><input type="number" required value={form.units_requested} onChange={e => setForm({...form, units_requested: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  <option value="routine">Routine</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="form-group"><label>Needed By</label><input type="date" value={form.needed_by} onChange={e => setForm({...form, needed_by: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Order</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}

export default OrderList;
