import React, { useState, useEffect } from 'react';
import { getDeferrals, generateReengagement } from '../services/api';
import './Pages.css';

function AIReengagement() {
  const [deferrals, setDeferrals] = useState([]);
  const [selectedDeferral, setSelectedDeferral] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDeferrals, setLoadingDeferrals] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeferrals();
  }, []);

  const fetchDeferrals = async () => {
    try {
      const res = await getDeferrals();
      setDeferrals(res.data);
    } catch (err) {
      setError('Failed to load deferrals');
    }
    setLoadingDeferrals(false);
  };

  const getSelectedDeferralData = () => {
    return deferrals.find(d => String(d.id || d._id) === selectedDeferral);
  };

  const handleGenerate = async () => {
    const deferral = getSelectedDeferralData();
    if (!deferral) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await generateReengagement(deferral);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI re-engagement generation failed');
    }
    setLoading(false);
  };

  const parseResult = (data) => {
    if (!data) return '';
    const content = typeof data === 'string' ? data : (data.result || data.content || data.message || JSON.stringify(data));
    return content;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const selected = getSelectedDeferralData();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">💌</span> AI Donor Re-engagement</h1>
      </div>
      <p className="page-subtitle">Generate personalized re-engagement messages for deferred donors</p>

      <div className="ai-container">
        {loadingDeferrals ? (
          <div className="loading-spinner"><div className="spinner"></div><p>Loading deferrals...</p></div>
        ) : (
          <>
            <div className="ai-form-section">
              <h3>Select Deferred Donor</h3>
              <div className="form-group">
                <label>Deferred Donor</label>
                <select
                  value={selectedDeferral}
                  onChange={e => { setSelectedDeferral(e.target.value); setResult(null); }}
                >
                  <option value="">-- Select a deferred donor --</option>
                  {deferrals.map(d => (
                    <option key={d.id || d._id} value={String(d.id || d._id)}>
                      {d.donor_name || d.donorName || `Donor #${d.donor_id || d.donorId || d.id}`} - {d.reason || d.deferral_reason || 'No reason'}
                    </option>
                  ))}
                </select>
              </div>

              {selected && (
                <div className="detail-card" style={{ marginBottom: '20px', padding: '20px' }}>
                  <h4 style={{ marginBottom: '12px', color: 'var(--text)' }}>Deferral Details</h4>
                  <div className="detail-grid">
                    <div className="detail-field">
                      <span className="label">Donor</span>
                      <span className="value">{selected.donor_name || selected.donorName || `Donor #${selected.donor_id || selected.donorId || selected.id}`}</span>
                    </div>
                    <div className="detail-field">
                      <span className="label">Reason</span>
                      <span className="value">{selected.reason || selected.deferral_reason || 'N/A'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="label">Deferral Date</span>
                      <span className="value">{formatDate(selected.deferral_date || selected.deferralDate || selected.created_at)}</span>
                    </div>
                    <div className="detail-field">
                      <span className="label">End Date</span>
                      <span className="value">{formatDate(selected.end_date || selected.endDate || selected.expiry_date)}</span>
                    </div>
                    <div className="detail-field">
                      <span className="label">Type</span>
                      <span className="value">
                        <span className={`badge ${selected.deferral_type === 'permanent' ? 'badge-inactive' : 'badge-warning'}`}>
                          {selected.deferral_type || selected.type || 'Temporary'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                className="btn btn-primary btn-lg"
                disabled={loading || !selectedDeferral}
              >
                {loading ? '⏳ Generating...' : '💌 Generate Re-engagement Message'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {result && (
              <div className="ai-result">
                <div className="ai-result-header">
                  <h3>Re-engagement Plan</h3>
                </div>
                <div className="ai-result-content">
                  {parseResult(result).split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <br key={i} />;
                    if (trimmed.startsWith('##') || trimmed.startsWith('**')) {
                      return <h4 key={i} className="ai-section-title">{trimmed.replace(/[#*]/g, '').trim()}</h4>;
                    }
                    if (trimmed.toLowerCase().includes('subject:') || trimmed.toLowerCase().includes('subject line:')) {
                      return (
                        <div key={i} className="ai-preview">
                          <div className="ai-preview-header">✉️ {trimmed}</div>
                        </div>
                      );
                    }
                    if (trimmed.toLowerCase().includes('dear') || trimmed.toLowerCase().includes('hi ') || trimmed.toLowerCase().includes('hello')) {
                      return (
                        <div key={i} className="ai-preview">
                          <div className="ai-preview-header">✉️ Personalized Email</div>
                          <div className="ai-preview-body">{trimmed}</div>
                        </div>
                      );
                    }
                    if (trimmed.toLowerCase().includes('timing') || trimmed.toLowerCase().includes('schedule') || trimmed.toLowerCase().includes('follow-up')) {
                      return <div key={i} className="ai-recommendation"><h4>{trimmed.replace(/[#*-•]/g, '').trim()}</h4></div>;
                    }
                    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                      return <div key={i} className="ai-list-item">{trimmed.replace(/^[-•*]\s*/, '')}</div>;
                    }
                    if (/^\d+\./.test(trimmed)) {
                      return <div key={i} className="ai-list-item ai-list-numbered">{trimmed}</div>;
                    }
                    return <p key={i} className="ai-text">{trimmed}</p>;
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AIReengagement;
