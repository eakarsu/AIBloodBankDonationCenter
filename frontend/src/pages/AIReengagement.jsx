import NativeAIReport from "../components/NativeAIReport";
import NativeAIControls from "../components/NativeAIControls";
import useNativeAIRequest from "../components/useNativeAIRequest";
import React, { useState, useEffect } from 'react';
import { getDeferrals, generateReengagement } from '../services/api';
import './Pages.css';

function AIReengagement() {
  const nativeAIRequest = useNativeAIRequest();

  const [deferrals, setDeferrals] = useState([]);
  const [selectedDeferral, setSelectedDeferral] = useState('');
  const [messageOptions, setMessageOptions] = useState({
    outreach_channel: 'email',
    tone: 'encouraging',
    additional_context: ''
  });
  const reengagementPresets = [
    { name: 'Warm email', values: { outreach_channel: 'email', tone: 'encouraging', additional_context: 'Thank the donor for their previous visit, explain that eligibility must be confirmed, and invite them to schedule online.' } },
    { name: 'Concise SMS', values: { outreach_channel: 'sms', tone: 'informational', additional_context: 'Keep the outreach brief, include a callback option, and avoid sharing sensitive deferral details in the message.' } },
    { name: 'Staff phone call', values: { outreach_channel: 'phone', tone: 'supportive', additional_context: 'Provide a short staff script, questions to confirm readiness, and a respectful opt-out reminder.' } }
  ];
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
      const res = await nativeAIRequest.run((signal) => generateReengagement({ ...deferral, ...messageOptions }, { signal }));
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
    <NativeAIControls
      presets={reengagementPresets.map((preset, index) => ({
        name: preset.name,
        fill: () => {
          const source = selectedDeferral || String(deferrals[Math.min(index, deferrals.length - 1)]?.id || deferrals[Math.min(index, deferrals.length - 1)]?._id || '');
          if (source) setSelectedDeferral(source);
          setMessageOptions({ ...preset.values });
          return { filled: Object.keys(preset.values).length + (source ? 1 : 0), manual: source ? [] : ['Deferred Donor'] };
        }
      }))}
      busy={nativeAIRequest.busy}
      onCancel={nativeAIRequest.cancel}
      context="Blood Bank Donation Center"
    ><div className="page-container">
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
                <select data-ai-field="selectedDeferral"
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

              <div className="form-row">
                <div className="form-group">
                  <label>Outreach Channel</label>
                  <select data-ai-field="outreach_channel" value={messageOptions.outreach_channel} onChange={e => setMessageOptions({...messageOptions, outreach_channel: e.target.value})}>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Message Tone</label>
                  <select data-ai-field="tone" value={messageOptions.tone} onChange={e => setMessageOptions({...messageOptions, tone: e.target.value})}>
                    <option value="encouraging">Encouraging</option>
                    <option value="informational">Informational</option>
                    <option value="supportive">Supportive</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Additional Context <span className="field-optional">Optional</span></label>
                <textarea data-ai-field="additional_context" value={messageOptions.additional_context} onChange={e => setMessageOptions({...messageOptions, additional_context: e.target.value})} placeholder="Add scheduling guidance or communication constraints..." />
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
                  <NativeAIReport response={result} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div></NativeAIControls>
  );
}

export default AIReengagement;
