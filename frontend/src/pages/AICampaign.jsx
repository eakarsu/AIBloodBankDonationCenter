import NativeAIReport from "../components/NativeAIReport";
import NativeAIControls from "../components/NativeAIControls";
import useNativeAIRequest from "../components/useNativeAIRequest";
import React, { useState } from 'react';
import { generateCampaign } from '../services/api';
import './Pages.css';

function AICampaign() {
  const nativeAIRequest = useNativeAIRequest();

  const [form, setForm] = useState({
    target_demographic: '',
    blood_type_needed: 'O+',
    urgency_level: 'medium',
    campaign_type: 'all',
    additional_context: ''
  });
  const campaignPresets = [
    {
      name: 'Campus drive',
      values: {
        target_demographic: 'College students and staff ages 18–35 near the downtown campus',
        blood_type_needed: 'O-',
        urgency_level: 'high',
        campaign_type: 'social',
        additional_context: 'Promote the Saturday mobile drive from 9:00 AM–3:00 PM, mention free parking, and use an encouraging, non-alarmist tone.'
      }
    },
    {
      name: 'Community appeal',
      values: {
        target_demographic: 'Eligible returning donors and neighborhood community groups',
        blood_type_needed: 'A+',
        urgency_level: 'medium',
        campaign_type: 'all',
        additional_context: 'Invite appointments for next week, highlight the one-hour visit, and include email, social, and SMS calls to action.'
      }
    },
    {
      name: 'Rare type outreach',
      values: {
        target_demographic: 'Previously engaged donors with rare blood types who are eligible to return',
        blood_type_needed: 'AB-',
        urgency_level: 'critical',
        campaign_type: 'email',
        additional_context: 'Request appointments within 48 hours without implying guaranteed eligibility; ask donors to confirm availability through the scheduling team.'
      }
    }
  ];
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await nativeAIRequest.run((signal) => generateCampaign(form, { signal }));
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
    <NativeAIControls
      presets={campaignPresets.map((preset) => ({
        name: preset.name,
        fill: () => { setForm({ ...preset.values }); return { filled: Object.keys(preset.values).length, manual: [] }; }
      }))}
      busy={nativeAIRequest.busy}
      onCancel={nativeAIRequest.cancel}
      context="Blood Bank Donation Center"
    ><div className="page-container">
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
              <input data-ai-field="target_demographic"
                type="text"
                value={form.target_demographic}
                onChange={e => setForm({...form, target_demographic: e.target.value})}
                placeholder="e.g., Young professionals aged 18-35, college students, community groups..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Blood Type Needed</label>
                <select data-ai-field="blood_type_needed" value={form.blood_type_needed} onChange={e => setForm({...form, blood_type_needed: e.target.value})}>
                  {bloodTypes.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Urgency Level</label>
                <select data-ai-field="urgency_level" value={form.urgency_level} onChange={e => setForm({...form, urgency_level: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Campaign Type</label>
              <select data-ai-field="campaign_type" value={form.campaign_type} onChange={e => setForm({...form, campaign_type: e.target.value})}>
                <option value="all">All Channels</option>
                <option value="email">Email</option>
                <option value="social">Social Media</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div className="form-group">
              <label>Additional Context <span className="field-optional">Optional</span></label>
              <textarea
                data-ai-field="additional_context"
                value={form.additional_context}
                onChange={e => setForm({...form, additional_context: e.target.value})}
                placeholder="Add event details, scheduling constraints, or tone guidance..."
              />
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
              <NativeAIReport response={result} />
            </div>
          </div>
        )}
      </div>
    </div></NativeAIControls>
  );
}

export default AICampaign;
