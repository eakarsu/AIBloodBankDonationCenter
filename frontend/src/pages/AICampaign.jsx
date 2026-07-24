import React, { useState } from 'react';
import { generateCampaign } from '../services/api';
import './Pages.css';

function AICampaign() {
  const [form, setForm] = useState({
    target_demographic: '',
    blood_type_needed: 'O+',
    urgency_level: 'medium',
    campaign_type: 'all'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await generateCampaign(form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI campaign generation failed');
    }
    setLoading(false);
  };

  const parseResult = (data) => {
    if (!data) return '';
    const content = typeof data === 'string' ? data : (data.result || data.content || data.campaign || JSON.stringify(data));
    return content;
  };

  const getUrgencyBadge = (level) => {
    const classes = {
      low: 'badge badge-active',
      medium: 'badge badge-pending',
      high: 'badge badge-warning',
      critical: 'badge badge-inactive'
    };
    return classes[level] || 'badge';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">📢</span> AI Campaign Generator</h1>
      </div>
      <p className="page-subtitle">Generate targeted donor recruitment campaigns using AI</p>

      <div className="ai-container">
        <div className="ai-form-section">
          <h3>Campaign Parameters</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Target Demographic</label>
              <input
                type="text"
                value={form.target_demographic}
                onChange={e => setForm({...form, target_demographic: e.target.value})}
                placeholder="e.g., Young professionals aged 18-35, college students, community groups..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Blood Type Needed</label>
                <select value={form.blood_type_needed} onChange={e => setForm({...form, blood_type_needed: e.target.value})}>
                  {bloodTypes.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Urgency Level</label>
                <select value={form.urgency_level} onChange={e => setForm({...form, urgency_level: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Campaign Type</label>
              <select value={form.campaign_type} onChange={e => setForm({...form, campaign_type: e.target.value})}>
                <option value="all">All Channels</option>
                <option value="email">Email</option>
                <option value="social">Social Media</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            <div className="campaign-summary" style={{ marginBottom: '20px' }}>
              <span className={getUrgencyBadge(form.urgency_level)}>{form.urgency_level.toUpperCase()}</span>
              {form.blood_type_needed && <span className="badge badge-transit" style={{ marginLeft: '8px' }}>{form.blood_type_needed}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Generating...' : '📢 Generate Campaign'}
            </button>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="ai-result">
            <div className="ai-result-header">
              <h3>Generated Campaign Content</h3>
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
                if (trimmed.toLowerCase().includes('email') && (trimmed.startsWith('#') || trimmed.startsWith('*'))) {
                  return (
                    <div key={i} className="ai-preview">
                      <div className="ai-preview-header">✉️ Email Preview</div>
                      <div className="ai-preview-body">{trimmed.replace(/[#*]/g, '').trim()}</div>
                    </div>
                  );
                }
                if (trimmed.toLowerCase().includes('social media') && (trimmed.startsWith('#') || trimmed.startsWith('*'))) {
                  return (
                    <div key={i} className="ai-preview">
                      <div className="ai-preview-header">📱 Social Media Post</div>
                      <div className="ai-preview-body">{trimmed.replace(/[#*]/g, '').trim()}</div>
                    </div>
                  );
                }
                if (trimmed.toLowerCase().includes('sms') && (trimmed.startsWith('#') || trimmed.startsWith('*'))) {
                  return (
                    <div key={i} className="ai-preview">
                      <div className="ai-preview-header">💬 SMS Message</div>
                      <div className="ai-preview-body">{trimmed.replace(/[#*]/g, '').trim()}</div>
                    </div>
                  );
                }
                if (trimmed.toLowerCase().includes('urgent') || trimmed.toLowerCase().includes('critical')) {
                  return <div key={i} className="ai-badge ai-badge-danger">{trimmed}</div>;
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
      </div>
    </div>
  );
}

export default AICampaign;
