import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEquipment, createEquipmentItem } from '../services/api';
import './Pages.css';

function EquipmentList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ equipment_name: '', equipment_type: '', serial_number: '', location: '', last_calibration: '', next_calibration: '', calibrated_by: '', manufacturer: '', model: '', maintenance_notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getEquipment();
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setFiltered(data);
    } catch { setItems([]); setFiltered([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(d =>
      (d.equipment_name || '').toLowerCase().includes(q) ||
      (d.equipment_type || '').toLowerCase().includes(q) ||
      (d.serial_number || '').toLowerCase().includes(q)
    ));
  }, [search, items]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createEquipmentItem(form);
      setShowModal(false);
      setForm({ equipment_name: '', equipment_type: '', serial_number: '', location: '', last_calibration: '', next_calibration: '', calibrated_by: '', manufacturer: '', model: '', maintenance_notes: '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create equipment'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u2699'}</span> Equipment <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Equipment</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search by name, type, serial number..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">{'\u2699'}</div><p>No equipment found</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment Name</th><th>Type</th><th>Serial Number</th><th>Location</th><th>Last Calibration</th><th>Next Calibration</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id || d._id} onClick={() => navigate(`/equipment/${d.id || d._id}`)}>
                  <td><strong>{d.equipment_name}</strong></td>
                  <td>{d.equipment_type}</td>
                  <td>{d.serial_number}</td>
                  <td>{d.location}</td>
                  <td>{d.last_calibration}</td>
                  <td>{d.next_calibration}</td>
                  <td><span className={`badge badge-${d.status === 'current' ? 'active' : d.status === 'due_soon' ? 'warning' : d.status === 'overdue' ? 'danger' : 'active'}`}>{d.status || 'current'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Equipment</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>Equipment Name</label><input required value={form.equipment_name} onChange={e => setForm({...form, equipment_name: e.target.value})} /></div>
                <div className="form-group"><label>Equipment Type</label>
                  <select required value={form.equipment_type} onChange={e => setForm({...form, equipment_type: e.target.value})}>
                    <option value="">Select</option>
                    {['Centrifuge','Blood Mixer','Refrigerator','Freezer','Platelet Agitator','Hematology Analyzer','Blood Warmer','Temperature Monitor','Transport Container','Apheresis Machine'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Serial Number</label><input required value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} /></div>
                <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Last Calibration</label><input type="date" value={form.last_calibration} onChange={e => setForm({...form, last_calibration: e.target.value})} /></div>
                <div className="form-group"><label>Next Calibration</label><input type="date" value={form.next_calibration} onChange={e => setForm({...form, next_calibration: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Calibrated By</label><input value={form.calibrated_by} onChange={e => setForm({...form, calibrated_by: e.target.value})} /></div>
                <div className="form-group"><label>Manufacturer</label><input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Model</label><input value={form.model} onChange={e => setForm({...form, model: e.target.value})} /></div>
                <div className="form-group"><label></label></div>
              </div>
              <div className="form-group"><label>Maintenance Notes</label><textarea value={form.maintenance_notes} onChange={e => setForm({...form, maintenance_notes: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Equipment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EquipmentList;
