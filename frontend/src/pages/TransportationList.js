import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransportations, createTransportation } from '../services/api';
import './Pages.css';

function TransportationList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ order_id: '', courier_name: '', vehicle_id: '', departure_time: '', arrival_time: '', origin: '', destination: '', temperature_log: '', status: 'pending', notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getTransportations();
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setFiltered(data);
    } catch { setItems([]); setFiltered([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(d =>
      (d.courier_name || '').toLowerCase().includes(q) ||
      (d.destination || '').toLowerCase().includes(q) ||
      (d.origin || '').toLowerCase().includes(q)
    ));
  }, [search, items]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTransportation(form);
      setShowModal(false);
      setForm({ order_id: '', courier_name: '', vehicle_id: '', departure_time: '', arrival_time: '', origin: '', destination: '', temperature_log: '', status: 'pending', notes: '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create transportation'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u{1F69A}'}</span> Transportation <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Transportation</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search by courier, origin, destination..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">{'\u{1F69A}'}</div><p>No transportation records found</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Courier</th><th>Vehicle</th><th>Origin</th><th>Destination</th><th>Departure</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id || d._id} onClick={() => navigate(`/transportation/${d.id || d._id}`)}>
                  <td><strong>{d.courier_name}</strong></td>
                  <td>{d.vehicle_id}</td>
                  <td>{d.origin}</td>
                  <td>{d.destination}</td>
                  <td>{d.departure_time}</td>
                  <td><span className={`badge badge-${d.status || 'pending'}`}>{d.status || 'pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Transportation</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>Order ID</label><input required value={form.order_id} onChange={e => setForm({...form, order_id: e.target.value})} /></div>
                <div className="form-group"><label>Courier Name</label><input required value={form.courier_name} onChange={e => setForm({...form, courier_name: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Vehicle ID</label><input value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="pending">Pending</option><option value="in_transit">In Transit</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Departure Time</label><input type="datetime-local" value={form.departure_time} onChange={e => setForm({...form, departure_time: e.target.value})} /></div>
                <div className="form-group"><label>Arrival Time</label><input type="datetime-local" value={form.arrival_time} onChange={e => setForm({...form, arrival_time: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Origin</label><input required value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} /></div>
                <div className="form-group"><label>Destination</label><input required value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Temperature Log</label><textarea value={form.temperature_log} onChange={e => setForm({...form, temperature_log: e.target.value})} /></div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Transportation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransportationList;
