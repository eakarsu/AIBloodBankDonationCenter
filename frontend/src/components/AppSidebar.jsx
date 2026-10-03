import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppSidebar.css';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', group: 'Workspace' },
  { to: '/donors', label: 'Donor List', group: 'Workspace' },
  { to: '/donations', label: 'Donation List', group: 'Workspace' },
  { to: '/screening', label: 'Screening List', group: 'Workspace' },
  { to: '/deferrals', label: 'Deferral List', group: 'Workspace' },
  { to: '/collections', label: 'Collection List', group: 'Workspace' },
  { to: '/bloodtyping', label: 'Blood Typing List', group: 'Workspace' },
  { to: '/components', label: 'Component List', group: 'Workspace' },
  { to: '/inventory', label: 'Inventory List', group: 'Workspace' },
  { to: '/orders', label: 'Order List', group: 'Workspace' },
  { to: '/transportation', label: 'Transportation List', group: 'Workspace' },
  { to: '/reactions', label: 'Reaction List', group: 'Workspace' },
  { to: '/equipment', label: 'Equipment List', group: 'Workspace' },
  { to: '/staff', label: 'Staff List', group: 'Workspace' },
  { to: '/drives', label: 'Drive List', group: 'Workspace' },
  { to: '/rewards', label: 'Reward List', group: 'Workspace' },
  { to: '/ai/eligibility', label: 'AI Eligibility', group: 'AI tools' },
  { to: '/ai/expiration', label: 'AI Expiration', group: 'AI tools' },
  { to: '/ai/campaign', label: 'AI Campaign', group: 'AI tools' },
  { to: '/ai/reengagement', label: 'AI Reengagement', group: 'AI tools' },
  { to: '/ai/forecast', label: 'AI Forecast', group: 'AI tools' },
];

export default function AppSidebar() {
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AIBlood Bank Donation Center</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
