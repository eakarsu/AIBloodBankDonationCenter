import NativeAIReport from "../components/NativeAIReport";
import NativeAIControls from "../components/NativeAIControls";
import useNativeAIRequest from "../components/useNativeAIRequest";
import React, { useState } from 'react';
import { checkEligibility } from '../services/api';
import './Pages.css';

function AIEligibility() {
  const nativeAIRequest = useNativeAIRequest();

  const [form, setForm] = useState({
    temperature: '98.6', blood_pressure_systolic: '120', blood_pressure_diastolic: '80',
    pulse: '72', hemoglobin: '14.5', weight: '160',
    travel_history: '', medication_list: '',
    recent_illness: false, recent_surgery: false, recent_tattoo: false, pregnant: false
  });
  const eligibilityPresets = [
    {
      name: 'Routine screening',
      values: {
        temperature: '98.4', blood_pressure_systolic: '118', blood_pressure_diastolic: '76',
        pulse: '68', hemoglobin: '14.2', weight: '165',
        travel_history: 'No travel outside the United States in the last 12 months.',
        medication_list: 'Daily multivitamin; no prescription medications.',
        recent_illness: false, recent_surgery: false, recent_tattoo: false, pregnant: false
      }
    },
    {
      name: 'Travel review',
      values: {
        temperature: '98.9', blood_pressure_systolic: '124', blood_pressure_diastolic: '80',
        pulse: '76', hemoglobin: '13.6', weight: '148',
        travel_history: 'Visited San José, Costa Rica for seven days in February 2026; no rural overnight stays.',
        medication_list: 'Cetirizine 10 mg as needed for seasonal allergies.',
        recent_illness: false, recent_surgery: false, recent_tattoo: true, pregnant: false
      }
    },
    {
      name: 'Post-procedure review',
      values: {
        temperature: '98.7', blood_pressure_systolic: '122', blood_pressure_diastolic: '79',
        pulse: '74', hemoglobin: '13.8', weight: '180',
        travel_history: 'No international travel in the last 12 months.',
        medication_list: 'Ibuprofen 200 mg as needed; last dose three days ago.',
        recent_illness: false, recent_surgery: true, recent_tattoo: false, pregnant: false
      }
    }
  ];
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await nativeAIRequest.run((signal) => checkEligibility(form, { signal }));
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
    <NativeAIControls
      presets={eligibilityPresets.map((preset) => ({
        name: preset.name,
        fill: () => { setForm({ ...preset.values }); return { filled: Object.keys(preset.values).length, manual: [] }; }
      }))}
      busy={nativeAIRequest.busy}
      onCancel={nativeAIRequest.cancel}
      context="Blood Bank Donation Center"
    ><div className="page-container">
      <div className="page-header">
        <h1><span className="icon">🤖</span> AI Eligibility Screening</h1>
      </div>
      <p className="page-subtitle">Enter donor health questionnaire data for AI-powered eligibility assessment</p>

      <div className="ai-container">
        <div className="ai-form-section">
          <h3>Health Questionnaire</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Temperature (°F)</label><input data-ai-field="temperature" type="number" step="0.1" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} /></div>
              <div className="form-group"><label>Weight (lbs)</label><input data-ai-field="weight" type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>BP Systolic</label><input data-ai-field="blood_pressure_systolic" type="number" value={form.blood_pressure_systolic} onChange={e => setForm({...form, blood_pressure_systolic: e.target.value})} /></div>
              <div className="form-group"><label>BP Diastolic</label><input data-ai-field="blood_pressure_diastolic" type="number" value={form.blood_pressure_diastolic} onChange={e => setForm({...form, blood_pressure_diastolic: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Pulse (bpm)</label><input data-ai-field="pulse" type="number" value={form.pulse} onChange={e => setForm({...form, pulse: e.target.value})} /></div>
              <div className="form-group"><label>Hemoglobin (g/dL)</label><input data-ai-field="hemoglobin" type="number" step="0.1" value={form.hemoglobin} onChange={e => setForm({...form, hemoglobin: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Travel History (last 12 months)</label><textarea data-ai-field="travel_history" value={form.travel_history} onChange={e => setForm({...form, travel_history: e.target.value})} placeholder="List countries visited..." /></div>
            <div className="form-group"><label>Current Medications</label><textarea data-ai-field="medication_list" value={form.medication_list} onChange={e => setForm({...form, medication_list: e.target.value})} placeholder="List all current medications..." /></div>
            <div className="checkbox-group">
              <label className="checkbox-label"><input data-ai-field="recent_illness" type="checkbox" checked={form.recent_illness} onChange={e => setForm({...form, recent_illness: e.target.checked})} /> Recent illness (last 2 weeks)</label>
              <label className="checkbox-label"><input data-ai-field="recent_surgery" type="checkbox" checked={form.recent_surgery} onChange={e => setForm({...form, recent_surgery: e.target.checked})} /> Recent surgery (last 12 months)</label>
              <label className="checkbox-label"><input data-ai-field="recent_tattoo" type="checkbox" checked={form.recent_tattoo} onChange={e => setForm({...form, recent_tattoo: e.target.checked})} /> Recent tattoo/piercing (last 3 months)</label>
              <label className="checkbox-label"><input data-ai-field="pregnant" type="checkbox" checked={form.pregnant} onChange={e => setForm({...form, pregnant: e.target.checked})} /> Currently pregnant</label>
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
              <NativeAIReport response={result} />
            </div>
          </div>
        )}
      </div>
    </div></NativeAIControls>
  );
}

export default AIEligibility;
