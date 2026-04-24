import React, { useState } from 'react';
import { checkEligibility } from '../services/api';
import './Pages.css';

function AIEligibility() {
  const [form, setForm] = useState({
    temperature: '98.6', blood_pressure_systolic: '120', blood_pressure_diastolic: '80',
    pulse: '72', hemoglobin: '14.5', weight: '160',
    travel_history: '', medication_list: '',
    recent_illness: false, recent_surgery: false, recent_tattoo: false, pregnant: false
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await checkEligibility(form);
      setResult(res.data);
    } catch (err) { setError(err.response?.data?.error || 'AI analysis failed'); }
    setLoading(false);
  };

  const parseResult = (data) => {
    if (!data) return null;
    const content = typeof data === 'string' ? data : (data.result || data.content || data.analysis || JSON.stringify(data));
    return content;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="icon">🤖</span> AI Eligibility Screening</h1>
      </div>
      <p className="page-subtitle">Enter donor health questionnaire data for AI-powered eligibility assessment</p>

      <div className="ai-container">
        <div className="ai-form-section">
          <h3>Health Questionnaire</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Temperature (°F)</label><input type="number" step="0.1" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} /></div>
              <div className="form-group"><label>Weight (lbs)</label><input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>BP Systolic</label><input type="number" value={form.blood_pressure_systolic} onChange={e => setForm({...form, blood_pressure_systolic: e.target.value})} /></div>
              <div className="form-group"><label>BP Diastolic</label><input type="number" value={form.blood_pressure_diastolic} onChange={e => setForm({...form, blood_pressure_diastolic: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Pulse (bpm)</label><input type="number" value={form.pulse} onChange={e => setForm({...form, pulse: e.target.value})} /></div>
              <div className="form-group"><label>Hemoglobin (g/dL)</label><input type="number" step="0.1" value={form.hemoglobin} onChange={e => setForm({...form, hemoglobin: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Travel History (last 12 months)</label><textarea value={form.travel_history} onChange={e => setForm({...form, travel_history: e.target.value})} placeholder="List countries visited..." /></div>
            <div className="form-group"><label>Current Medications</label><textarea value={form.medication_list} onChange={e => setForm({...form, medication_list: e.target.value})} placeholder="List all current medications..." /></div>
            <div className="checkbox-group">
              <label className="checkbox-label"><input type="checkbox" checked={form.recent_illness} onChange={e => setForm({...form, recent_illness: e.target.checked})} /> Recent illness (last 2 weeks)</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.recent_surgery} onChange={e => setForm({...form, recent_surgery: e.target.checked})} /> Recent surgery (last 12 months)</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.recent_tattoo} onChange={e => setForm({...form, recent_tattoo: e.target.checked})} /> Recent tattoo/piercing (last 3 months)</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.pregnant} onChange={e => setForm({...form, pregnant: e.target.checked})} /> Currently pregnant</label>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Analyzing...' : '🤖 Analyze Eligibility'}
            </button>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="ai-result">
            <div className="ai-result-header">
              <h3>AI Analysis Result</h3>
            </div>
            <div className="ai-result-content">
              {parseResult(result).split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <br key={i} />;
                if (trimmed.startsWith('##') || trimmed.startsWith('**')) {
                  return <h4 key={i} className="ai-section-title">{trimmed.replace(/[#*]/g, '').trim()}</h4>;
                }
                if (trimmed.toLowerCase().includes('eligible') && !trimmed.toLowerCase().includes('not eligible') && !trimmed.toLowerCase().includes('ineligible')) {
                  return <div key={i} className="ai-badge ai-badge-success">{trimmed}</div>;
                }
                if (trimmed.toLowerCase().includes('deferred') || trimmed.toLowerCase().includes('not eligible') || trimmed.toLowerCase().includes('ineligible')) {
                  return <div key={i} className="ai-badge ai-badge-danger">{trimmed}</div>;
                }
                if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                  return <div key={i} className="ai-list-item">{trimmed.replace(/^[-•*]\s*/, '')}</div>;
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

export default AIEligibility;
