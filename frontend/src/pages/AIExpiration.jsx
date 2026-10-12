import NativeAIReport from "../components/NativeAIReport";
import NativeAIControls from "../components/NativeAIControls";
import useNativeAIRequest from "../components/useNativeAIRequest";
import React, { useState, useEffect } from 'react';
import { getInventory, predictExpiration } from '../services/api';
import './Pages.css';

function AIExpiration() {
  const nativeAIRequest = useNativeAIRequest();

  const [inventory, setInventory] = useState([]);
  const [analysis, setAnalysis] = useState({
    horizon_days: '7',
    priority: 'expiration_risk',
    additional_context: ''
  });
  const expirationPresets = [
    { name: '48-hour triage', values: { horizon_days: '2', priority: 'expiration_risk', additional_context: 'Prioritize components expiring within 48 hours and clearly separate immediate holds from transfer opportunities.' } },
    { name: 'Weekly redistribution', values: { horizon_days: '7', priority: 'redistribution', additional_context: 'Prepare a seven-day redistribution plan that groups recommendations by blood type and component.' } },
    { name: 'Waste prevention', values: { horizon_days: '14', priority: 'waste_prevention', additional_context: 'Review the next 14 days, quantify preventable waste, and list assumptions when usage history is incomplete.' } }
  ];
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await getInventory();
      setInventory(res.data);
    } catch (err) {
      setError('Failed to load inventory data');
    }
    setLoadingInventory(false);
  };

  const getInventorySummary = () => {
    const summary = {};
    inventory.forEach(item => {
      const type = item.blood_type || item.bloodType || 'Unknown';
      if (!summary[type]) summary[type] = { count: 0, units: 0 };
      summary[type].count += 1;
      summary[type].units += item.units || item.quantity || 1;
    });
    return summary;
  };

  const handleAnalyze = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await nativeAIRequest.run((signal) => predictExpiration({ inventory, ...analysis }, { signal }));
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI analysis failed');
    }
    setLoading(false);
  };

  const parseResult = (data) => {
    if (!data) return '';
    const content = typeof data === 'string' ? data : (data.result || data.content || data.analysis || data.prediction || JSON.stringify(data));
    return content;
  };

  const summary = getInventorySummary();

  return (
    <NativeAIControls
      presets={expirationPresets.map((preset) => ({
        name: preset.name,
        fill: () => { setAnalysis({ ...preset.values }); return { filled: Object.keys(preset.values).length, manual: [] }; }
      }))}
      busy={nativeAIRequest.busy}
      onCancel={nativeAIRequest.cancel}
      context="Blood Bank Donation Center"
    ><div className="page-container">
      <div className="page-header">
        <h1><span className="icon">📅</span> AI Expiration Prediction</h1>
      </div>
      <p className="page-subtitle">Analyze inventory expiration risk and get redistribution recommendations</p>

      <div className="ai-container">
        {loadingInventory ? (
          <div className="loading-spinner"><div className="spinner"></div><p>Loading inventory...</p></div>
        ) : (
          <>
            <div className="ai-form-section">
              <h3>Current Inventory Summary</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Analysis Horizon</label>
                  <select data-ai-field="horizon_days" value={analysis.horizon_days} onChange={e => setAnalysis({...analysis, horizon_days: e.target.value})}>
                    <option value="2">Next 48 hours</option>
                    <option value="7">Next 7 days</option>
                    <option value="14">Next 14 days</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Analysis Priority</label>
                  <select data-ai-field="priority" value={analysis.priority} onChange={e => setAnalysis({...analysis, priority: e.target.value})}>
                    <option value="expiration_risk">Expiration risk</option>
                    <option value="redistribution">Redistribution</option>
                    <option value="waste_prevention">Waste prevention</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Additional Context <span className="field-optional">Optional</span></label>
                <textarea data-ai-field="additional_context" value={analysis.additional_context} onChange={e => setAnalysis({...analysis, additional_context: e.target.value})} placeholder="Add usage constraints or planning assumptions..." />
              </div>
              {Object.keys(summary).length > 0 ? (
                <div className="table-wrapper" style={{ marginBottom: '20px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Blood Type</th>
                        <th>Items</th>
                        <th>Total Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summary).map(([type, data]) => (
                        <tr key={type} style={{ cursor: 'default' }}>
                          <td><strong>{type}</strong></td>
                          <td>{data.count}</td>
                          <td>{data.units}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>No inventory data available</p>
                </div>
              )}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-value">{inventory.length}</div>
                  <div className="stat-label">Total Items</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🩸</div>
                  <div className="stat-value">{Object.keys(summary).length}</div>
                  <div className="stat-label">Blood Types</div>
                </div>
              </div>
              <button onClick={handleAnalyze} className="btn btn-primary btn-lg" disabled={loading || inventory.length === 0}>
                {loading ? '⏳ Analyzing...' : '📅 Analyze Expiration Risk'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {result && (
              <div className="ai-result">
                <div className="ai-result-header">
                  <h3>Expiration Analysis</h3>
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

export default AIExpiration;
