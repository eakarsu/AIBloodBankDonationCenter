import React, { useState, useEffect } from 'react';
import { getInventory, predictExpiration } from '../services/api';
import './Pages.css';

function AIExpiration() {
  const [inventory, setInventory] = useState([]);
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
      const res = await predictExpiration({ inventory });
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
    <div className="page-container">
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
                  {parseResult(result).split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <br key={i} />;
                    if (trimmed.startsWith('##') || trimmed.startsWith('**')) {
                      return <h4 key={i} className="ai-section-title">{trimmed.replace(/[#*]/g, '').trim()}</h4>;
                    }
                    if (trimmed.toLowerCase().includes('critical') || trimmed.toLowerCase().includes('expiring') || trimmed.toLowerCase().includes('expired')) {
                      return <div key={i} className="ai-alert ai-alert-danger">{trimmed}</div>;
                    }
                    if (trimmed.toLowerCase().includes('warning') || trimmed.toLowerCase().includes('soon') || trimmed.toLowerCase().includes('caution')) {
                      return <div key={i} className="ai-alert ai-alert-warning">{trimmed}</div>;
                    }
                    if (trimmed.toLowerCase().includes('safe') || trimmed.toLowerCase().includes('good') || trimmed.toLowerCase().includes('sufficient')) {
                      return <div key={i} className="ai-alert ai-alert-success">{trimmed}</div>;
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

export default AIExpiration;
