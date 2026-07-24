import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRewards, createReward } from '../services/api';
import './Pages.css';

function RewardList() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ donor_id: '', reward_type: '', points: '', milestone: '', description: '', earned_date: '', status: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getRewards();
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setFiltered(data);
    } catch { setItems([]); setFiltered([]); }
    setLoading(false);
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(d =>
      (d.reward_type || '').toLowerCase().includes(q) ||
      (d.milestone || '').toLowerCase().includes(q)
    ));
  }, [search, items]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createReward(form);
      setShowModal(false);
      setForm({ donor_id: '', reward_type: '', points: '', milestone: '', description: '', earned_date: '', status: '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create reward'); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div><p>Loading...</p></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">{'\uD83C\uDFC6'}</span> Rewards <span className="count-badge">{filtered.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Reward</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search by reward type, milestone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">{'\uD83C\uDFC6'}</div><p>No rewards found</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor ID</th><th>Reward Type</th><th>Points</th><th>Milestone</th><th>Earned Date</th><th>Redeemed</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id || d._id} onClick={() => navigate(`/rewards/${d.id || d._id}`)}>
                  <td>{d.donor_id}</td>
                  <td><strong>{d.reward_type}</strong></td>
                  <td>{d.points}</td>
                  <td>{d.milestone}</td>
                  <td>{d.earned_date}</td>
                  <td>{d.redeemed ? 'Yes' : 'No'}</td>
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
            <h2>Add New Reward</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>Donor ID</label><input required value={form.donor_id} onChange={e => setForm({...form, donor_id: e.target.value})} /></div>
                <div className="form-group"><label>Reward Type</label>
                  <select required value={form.reward_type} onChange={e => setForm({...form, reward_type: e.target.value})}>
                    <option value="">Select</option>
                    {['Points','Milestone Badge','Gift Card','Certificate','Referral Bonus'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Points</label><input type="number" value={form.points} onChange={e => setForm({...form, points: e.target.value})} /></div>
                <div className="form-group"><label>Milestone</label><input value={form.milestone} onChange={e => setForm({...form, milestone: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Earned Date</label><input type="date" value={form.earned_date} onChange={e => setForm({...form, earned_date: e.target.value})} /></div>
                <div className="form-group"><label>Status</label><input value={form.status} onChange={e => setForm({...form, status: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Reward</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RewardList;
