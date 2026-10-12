import NativeAIReport from "../components/NativeAIReport";
import NativeAIControls from "../components/NativeAIControls";
import useNativeAIRequest from "../components/useNativeAIRequest";
import React, { useState, useEffect } from 'react';
import { getInventory, getOrders, forecastDemand } from '../services/api';
import './Pages.css';

function AIForecast() {
  const nativeAIRequest = useNativeAIRequest();

  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [forecastOptions, setForecastOptions] = useState({
    forecast_days: '30',
    service_level_target: '95',
    additional_context: ''
  });
  const forecastPresets = [
    { name: 'Two-week operations', values: { forecast_days: '14', service_level_target: '95', additional_context: 'Emphasize near-term hospital orders and flag any blood type likely to fall below the operating buffer.' } },
    { name: 'Monthly planning', values: { forecast_days: '30', service_level_target: '97', additional_context: 'Build a 30-day collection plan with blood-type targets, assumptions, and a prioritized action list.' } },
    { name: 'Seasonal readiness', values: { forecast_days: '60', service_level_target: '98', additional_context: 'Model a conservative seasonal scenario, identify rare-type risks, and distinguish evidence from assumptions.' } }
  ];
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, ordRes] = await Promise.all([getInventory(), getOrders()]);
      setInventory(invRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
    setLoadingData(false);
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

  const handleForecast = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await nativeAIRequest.run((signal) => forecastDemand({ inventory, orders, ...forecastOptions }, { signal }));
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI forecast failed');
    }
    setLoading(false);
  };

  const parseResult = (data) => {
    if (!data) return '';
    const content = typeof data === 'string' ? data : (data.result || data.content || data.forecast || JSON.stringify(data));
    return content;
  };

  const summary = getInventorySummary();

  return (
    <NativeAIControls
      presets={forecastPresets.map((preset) => ({
        name: preset.name,
        fill: () => { setForecastOptions({ ...preset.values }); return { filled: Object.keys(preset.values).length, manual: [] }; }
      }))}
      busy={nativeAIRequest.busy}
      onCancel={nativeAIRequest.cancel}
      context="Blood Bank Donation Center"
    ><div className="page-container">
      <div className="page-header">
        <h1><span className="icon">📊</span> AI Demand Forecast</h1>
      </div>
      <p className="page-subtitle">Predict future blood demand based on inventory and order trends</p>

      <div className="ai-container">
        {loadingData ? (
          <div className="loading-spinner"><div className="spinner"></div><p>Loading data...</p></div>
        ) : (
          <>
            <div className="ai-form-section">
              <h3>Current Data Overview</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Forecast Horizon</label>
                  <select data-ai-field="forecast_days" value={forecastOptions.forecast_days} onChange={e => setForecastOptions({...forecastOptions, forecast_days: e.target.value})}>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Service Level Target (%)</label>
                  <input data-ai-field="service_level_target" type="number" min="90" max="100" step="1" value={forecastOptions.service_level_target} onChange={e => setForecastOptions({...forecastOptions, service_level_target: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Additional Context <span className="field-optional">Optional</span></label>
                <textarea data-ai-field="additional_context" value={forecastOptions.additional_context} onChange={e => setForecastOptions({...forecastOptions, additional_context: e.target.value})} placeholder="Add known events, order assumptions, or buffer requirements..." />
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-value">{inventory.length}</div>
                  <div className="stat-label">Inventory Items</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{orders.length}</div>
                  <div className="stat-label">Recent Orders</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🩸</div>
                  <div className="stat-value">{Object.keys(summary).length}</div>
                  <div className="stat-label">Blood Types</div>
                </div>
              </div>

              {Object.keys(summary).length > 0 && (
                <div className="table-wrapper" style={{ marginBottom: '20px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Blood Type</th>
                        <th>Items in Stock</th>
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
              )}

              <button onClick={handleForecast} className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? '⏳ Forecasting...' : '📊 Generate Demand Forecast'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {result && (
              <div className="ai-result">
                <div className="ai-result-header">
                  <h3>Demand Forecast Analysis</h3>
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

export default AIForecast;
