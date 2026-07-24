import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDonors, getDonations, getInventory, getOrders, getScreenings, getDeferrals,
  getCollections, getBloodTypings, getComponents, getTransportations, getReactions,
  getEquipment, getStaff, getDrives, getRewards } from '../services/api';
import './Pages.css';

const featureCards = [
  { icon: '\u{1FA78}', title: 'Donor Management', desc: 'Manage donor profiles & registration', path: '/donors', key: 'donors' },
  { icon: '\u{1F4C5}', title: 'Donation Scheduling', desc: 'Schedule & track donations', path: '/donations', key: 'donations' },
  { icon: '\u{1F3E5}', title: 'Health Screening', desc: 'Pre-donation health questionnaires', path: '/screening', key: 'screenings' },
  { icon: '\u26A0\uFE0F', title: 'Deferral Tracking', desc: 'Manage temporary & permanent deferrals', path: '/deferrals', key: 'deferrals' },
  { icon: '\u{1F489}', title: 'Blood Collection', desc: 'Track collection procedures', path: '/collections', key: 'collections' },
  { icon: '\u{1F52C}', title: 'Blood Typing & Testing', desc: 'ABO/Rh typing & infectious disease testing', path: '/bloodtyping', key: 'bloodtypings' },
  { icon: '\u{1F9EA}', title: 'Component Processing', desc: 'RBC, FFP, Platelets, Cryo processing', path: '/components', key: 'components' },
  { icon: '\u{1F4E6}', title: 'Inventory Management', desc: 'Blood product inventory by type', path: '/inventory', key: 'inventory' },
  { icon: '\u{1F3E8}', title: 'Hospital Orders', desc: 'Manage hospital blood orders', path: '/orders', key: 'orders' },
  { icon: '\u{1F69A}', title: 'Transportation', desc: 'Courier & delivery tracking', path: '/transportation', key: 'transportations' },
  { icon: '\u26A1', title: 'Adverse Reactions', desc: 'Track & manage donor reactions', path: '/reactions', key: 'reactions' },
  { icon: '\u{1F527}', title: 'Equipment Calibration', desc: 'Calibration & maintenance logs', path: '/equipment', key: 'equipment' },
  { icon: '\u{1F468}\u200D\u2695\uFE0F', title: 'Staff Certifications', desc: 'Staff credentials & certifications', path: '/staff', key: 'staff' },
  { icon: '\u{1F690}', title: 'Mobile Drives', desc: 'Schedule mobile blood drives', path: '/drives', key: 'drives' },
  { icon: '\u{1F3C6}', title: 'Donor Rewards', desc: 'Recognition & rewards program', path: '/rewards', key: 'rewards' },
];

const aiCards = [
  { icon: '\u{1F916}', title: 'Eligibility Screening AI', desc: 'AI-powered donor eligibility assessment', path: '/ai/eligibility' },
  { icon: '\u{1F4CA}', title: 'Expiration Prediction AI', desc: 'Predict inventory expiration & redistribution', path: '/ai/expiration' },
  { icon: '\u{1F4E2}', title: 'Campaign Generator AI', desc: 'AI recruitment campaign content', path: '/ai/campaign' },
  { icon: '\u{1F48C}', title: 'Re-engagement AI', desc: 'Deferral re-engagement messaging', path: '/ai/reengagement' },
  { icon: '\u{1F4C8}', title: 'Demand Forecast AI', desc: 'Blood type demand forecasting', path: '/ai/forecast' },
];

function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchCounts = async () => {
      const fetchers = {
        donors: getDonors,
        donations: getDonations,
        screenings: getScreenings,
        deferrals: getDeferrals,
        collections: getCollections,
        bloodtypings: getBloodTypings,
        components: getComponents,
        inventory: getInventory,
        orders: getOrders,
        transportations: getTransportations,
        reactions: getReactions,
        equipment: getEquipment,
        staff: getStaff,
        drives: getDrives,
        rewards: getRewards,
      };
      const results = {};
      await Promise.allSettled(
        Object.entries(fetchers).map(async ([key, fn]) => {
          try {
            const res = await fn();
            results[key] = Array.isArray(res.data) ? res.data.length : 0;
          } catch {
            results[key] = 0;
          }
        })
      );
      setCounts(results);
    };
    fetchCounts();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Welcome to Blood Bank Manager</h1>
        <p>AI-Powered Blood Bank & Donation Center Management System</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">{'\u{1FA78}'}</div>
          <div className="stat-value">{counts.donors || 0}</div>
          <div className="stat-label">Total Donors</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">{'\u{1F4C5}'}</div>
          <div className="stat-value">{counts.donations || 0}</div>
          <div className="stat-label">Donations</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">{'\u{1F4E6}'}</div>
          <div className="stat-value">{counts.inventory || 0}</div>
          <div className="stat-label">Inventory Units</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">{'\u{1F3E8}'}</div>
          <div className="stat-value">{counts.orders || 0}</div>
          <div className="stat-label">Orders</div>
        </div>
      </div>

      <div className="section-title">Operations</div>
      <div className="dashboard-grid">
        {featureCards.map((card) => (
          <div key={card.path} className="dashboard-card" onClick={() => navigate(card.path)}>
            <div className="card-icon">{card.icon}</div>
            <div className="card-title">{card.title}</div>
            <div className="card-desc">{card.desc}</div>
            <div className="card-count">{counts[card.key] !== undefined ? counts[card.key] : '-'}</div>
          </div>
        ))}
      </div>

      <div className="section-title" style={{ marginTop: '32px' }}>AI Features</div>
      <div className="dashboard-grid">
        {aiCards.map((card) => (
          <div key={card.path} className="dashboard-card ai-card" onClick={() => navigate(card.path)}>
            <div className="card-icon">{card.icon}</div>
            <div className="card-title">{card.title}</div>
            <div className="card-desc">{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
