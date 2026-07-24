import React, { useState, useEffect } from 'react';
import { getInventory, getOrders, forecastDemand } from '../services/api';
import './Pages.css';

function AIForecast() {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
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
      const res = await forecastDemand({ inventory, orders });
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
    <div className="page-container">
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
                  {parseResult(result).split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <br key={i} />;
                    if (trimmed.startsWith('##') || trimmed.startsWith('**')) {
                      return <h4 key={i} className="ai-section-title">{trimmed.replace(/[#*]/g, '').trim()}</h4>;
                    }
                    if (trimmed.toLowerCase().includes('shortage') || trimmed.toLowerCase().includes('critical') || trimmed.toLowerCase().includes('deficit')) {
                      return <div key={i} className="ai-alert ai-alert-danger">{trimmed.replace(/[#*]/g, '').trim()}</div>;
                    }
                    if (trimmed.toLowerCase().includes('warning') || trimmed.toLowerCase().includes('low') || trimmed.toLowerCase().includes('declining')) {
                      return <div key={i} className="ai-alert ai-alert-warning">{trimmed.replace(/[#*]/g, '').trim()}</div>;
                    }
                    if (trimmed.toLowerCase().includes('surplus') || trimmed.toLowerCase().includes('adequate') || trimmed.toLowerCase().includes('sufficient')) {
                      return <div key={i} className="ai-alert ai-alert-success">{trimmed.replace(/[#*]/g, '').trim()}</div>;
                    }
                    if (trimmed.toLowerCase().includes('recommend') || trimmed.toLowerCase().includes('action')) {
                      return <div key={i} className="ai-recommendation"><h4>{trimmed.replace(/[#*-•]/g, '').trim()}</h4></div>;
                    }
                    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                      return <div key={i} className="ai-list-item">{trimmed.replace(/^[-•*]\s*/, '')}</div>;
                    }
                    if (/^\d+\./.test(trimmed)) {
                      return <div key={i} className="ai-list-item ai-list-numbered">{trimmed}</div>;
                    }
                    if (trimmed.includes('|') && trimmed.split('|').length >= 3) {
                      const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
                      if (cells.every(c => c.match(/^[-:]+$/))) return null;
                      return (
                        <div key={i} className="ai-table-row">
                          {cells.map((cell, j) => (
                            <span key={j} className="ai-table-cell">{cell}</span>
                          ))}
                        </div>
                      );
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

export default AIForecast;
