import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDrives, createDrive } from '../services/api';
import './Pages.css';

function DriveList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ drive_name: '', organization: '', location: '', address: '', drive_date: '', start_time: '', end_time: '', coordinator: '', goal_units: '', volunteers_needed: '', equipment_list: '', notes: '', status: 'planned' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getDrives();
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setFiltered(data);
    } catch { setItems([]); setFiltered([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(d =>
      (d.drive_name || '').toLowerCase().includes(q) ||
      (d.organization || '').toLowerCase().includes(q) ||
      (d.location || '').toLowerCase().includes(q)
    ));
  }, [search, items]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createDrive(form);
      setShowModal(false);
      setForm({ drive_name: '', organization: '', location: '', address: '', drive_date: '', start_time: '', end_time: '', coordinator: '', goal_units: '', volunteers_needed: '', equipment_list: '', notes: '', status: 'planned' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create drive'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\uD83D\uDE91'}</span> Blood Drives <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Drive</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search by drive name, organization, location..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">{'\uD83D\uDE91'}</div><p>No drives found</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Drive Name</th><th>Organization</th><th>Location</th><th>Date</th><th>Goal Units</th><th>Collected</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id || d._id} onClick={() => navigate(`/drives/${d.id || d._id}`)}>
                  <td><strong>{d.drive_name}</strong></td>
                  <td>{d.organization}</td>
                  <td>{d.location}</td>
                  <td>{d.drive_date}</td>
                  <td>{d.goal_units}</td>
                  <td>{d.collected_units || 0}</td>
                  <td><span className={`badge badge-${d.status || 'planned'}`}>{d.status || 'planned'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Blood Drive</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>Drive Name</label><input required value={form.drive_name} onChange={e => setForm({...form, drive_name: e.target.value})} /></div>
                <div className="form-group"><label>Organization</label><input required value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                <div className="form-group"><label>Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Drive Date</label><input type="date" value={form.drive_date} onChange={e => setForm({...form, drive_date: e.target.value})} /></div>
                <div className="form-group"><label>Coordinator</label><input value={form.coordinator} onChange={e => setForm({...form, coordinator: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start Time</label><input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} /></div>
                <div className="form-group"><label>End Time</label><input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Goal Units</label><input type="number" value={form.goal_units} onChange={e => setForm({...form, goal_units: e.target.value})} /></div>
                <div className="form-group"><label>Volunteers Needed</label><input type="number" value={form.volunteers_needed} onChange={e => setForm({...form, volunteers_needed: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="planned">Planned</option><option value="confirmed">Confirmed</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group"><label></label></div>
              </div>
              <div className="form-group"><label>Equipment List</label><textarea value={form.equipment_list} onChange={e => setForm({...form, equipment_list: e.target.value})} /></div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Drive</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriveList;
