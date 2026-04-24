import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReactions, createReaction } from '../services/api';
import './Pages.css';

function ReactionList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donor_id: '', collection_id: '', reaction_type: '', severity: '', symptoms: '', onset_time: '', treatment: '', outcome: '', reported_by: '', follow_up_required: false, notes: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getReactions();
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setFiltered(data);
    } catch { setItems([]); setFiltered([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(d =>
      (d.reaction_type || '').toLowerCase().includes(q) ||
      (d.severity || '').toLowerCase().includes(q)
    ));
  }, [search, items]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createReaction(form);
      setShowModal(false);
      setForm({ donor_id: '', collection_id: '', reaction_type: '', severity: '', symptoms: '', onset_time: '', treatment: '', outcome: '', reported_by: '', follow_up_required: false, notes: '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create reaction'); }
  };

  const severityBadge = (severity) => {
    const colors = { mild: 'green', moderate: 'orange', severe: 'red' };
    const color = colors[severity] || 'gray';
    return <span className="badge" style={{ backgroundColor: color, color: '#fff' }}>{severity}</span>;
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\u26A0\uFE0F'}</span> Reactions <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Reaction</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search by reaction type, severity..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">{'\u26A0\uFE0F'}</div><p>No reactions found</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor ID</th><th>Reaction Type</th><th>Severity</th><th>Onset Time</th><th>Outcome</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id || d._id} onClick={() => navigate(`/reactions/${d.id || d._id}`)}>
                  <td><strong>{d.donor_id}</strong></td>
                  <td>{d.reaction_type}</td>
                  <td>{severityBadge(d.severity)}</td>
                  <td>{d.onset_time}</td>
                  <td>{d.outcome}</td>
                  <td><span className={`badge badge-${d.status || 'active'}`}>{d.status || 'active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Reaction</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>Donor ID</label><input required value={form.donor_id} onChange={e => setForm({...form, donor_id: e.target.value})} /></div>
                <div className="form-group"><label>Collection ID</label><input value={form.collection_id} onChange={e => setForm({...form, collection_id: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Reaction Type</label>
                  <select required value={form.reaction_type} onChange={e => setForm({...form, reaction_type: e.target.value})}>
                    <option value="">Select</option>
                    <option value="Vasovagal">Vasovagal</option>
                    <option value="Hematoma">Hematoma</option>
                    <option value="Citrate Reaction">Citrate Reaction</option>
                    <option value="Nerve Irritation">Nerve Irritation</option>
                    <option value="Allergic">Allergic</option>
                    <option value="Arterial Puncture">Arterial Puncture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Severity</label>
                  <select required value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                    <option value="">Select</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Symptoms</label><textarea value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Onset Time</label><input type="datetime-local" value={form.onset_time} onChange={e => setForm({...form, onset_time: e.target.value})} /></div>
                <div className="form-group"><label>Reported By</label><input value={form.reported_by} onChange={e => setForm({...form, reported_by: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Treatment</label><textarea value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} /></div>
              <div className="form-group"><label>Outcome</label><input value={form.outcome} onChange={e => setForm({...form, outcome: e.target.value})} /></div>
              <div className="form-group">
                <label><input type="checkbox" checked={form.follow_up_required} onChange={e => setForm({...form, follow_up_required: e.target.checked})} /> Follow-up Required</label>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Reaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReactionList;
