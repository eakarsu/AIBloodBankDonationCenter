import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './App.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DonorList from './pages/DonorList';
import DonorDetail from './pages/DonorDetail';
import DonationList from './pages/DonationList';
import DonationDetail from './pages/DonationDetail';
import ScreeningList from './pages/ScreeningList';
import ScreeningDetail from './pages/ScreeningDetail';
import DeferralList from './pages/DeferralList';
import DeferralDetail from './pages/DeferralDetail';
import CollectionList from './pages/CollectionList';
import CollectionDetail from './pages/CollectionDetail';
import BloodTypingList from './pages/BloodTypingList';
import BloodTypingDetail from './pages/BloodTypingDetail';
import ComponentList from './pages/ComponentList';
import ComponentDetail from './pages/ComponentDetail';
import InventoryList from './pages/InventoryList';
import InventoryDetail from './pages/InventoryDetail';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import TransportationList from './pages/TransportationList';
import TransportationDetail from './pages/TransportationDetail';
import ReactionList from './pages/ReactionList';
import ReactionDetail from './pages/ReactionDetail';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import StaffList from './pages/StaffList';
import StaffDetail from './pages/StaffDetail';
import DriveList from './pages/DriveList';
import DriveDetail from './pages/DriveDetail';
import RewardList from './pages/RewardList';
import RewardDetail from './pages/RewardDetail';
import AIEligibility from './pages/AIEligibility';
import AIExpiration from './pages/AIExpiration';
import AICampaign from './pages/AICampaign';
import AIReengagement from './pages/AIReengagement';
import AIForecast from './pages/AIForecast';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          <span className="navbar-icon">&#x1F3E5;</span>
          <span className="navbar-title">Blood Bank & Donation Center</span>
        </Link>
        <div className="navbar-right">
          <span className="navbar-user">Admin</span>
          <button className="navbar-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/donors" element={<ProtectedRoute><DonorList /></ProtectedRoute>} />
          <Route path="/donors/:id" element={<ProtectedRoute><DonorDetail /></ProtectedRoute>} />
          <Route path="/donations" element={<ProtectedRoute><DonationList /></ProtectedRoute>} />
          <Route path="/donations/:id" element={<ProtectedRoute><DonationDetail /></ProtectedRoute>} />
          <Route path="/screening" element={<ProtectedRoute><ScreeningList /></ProtectedRoute>} />
          <Route path="/screening/:id" element={<ProtectedRoute><ScreeningDetail /></ProtectedRoute>} />
          <Route path="/deferrals" element={<ProtectedRoute><DeferralList /></ProtectedRoute>} />
          <Route path="/deferrals/:id" element={<ProtectedRoute><DeferralDetail /></ProtectedRoute>} />
          <Route path="/collections" element={<ProtectedRoute><CollectionList /></ProtectedRoute>} />
          <Route path="/collections/:id" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
          <Route path="/bloodtyping" element={<ProtectedRoute><BloodTypingList /></ProtectedRoute>} />
          <Route path="/bloodtyping/:id" element={<ProtectedRoute><BloodTypingDetail /></ProtectedRoute>} />
          <Route path="/components" element={<ProtectedRoute><ComponentList /></ProtectedRoute>} />
          <Route path="/components/:id" element={<ProtectedRoute><ComponentDetail /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryList /></ProtectedRoute>} />
          <Route path="/inventory/:id" element={<ProtectedRoute><InventoryDetail /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderList /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/transportation" element={<ProtectedRoute><TransportationList /></ProtectedRoute>} />
          <Route path="/transportation/:id" element={<ProtectedRoute><TransportationDetail /></ProtectedRoute>} />
          <Route path="/reactions" element={<ProtectedRoute><ReactionList /></ProtectedRoute>} />
          <Route path="/reactions/:id" element={<ProtectedRoute><ReactionDetail /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute><EquipmentList /></ProtectedRoute>} />
          <Route path="/equipment/:id" element={<ProtectedRoute><EquipmentDetail /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute><StaffList /></ProtectedRoute>} />
          <Route path="/staff/:id" element={<ProtectedRoute><StaffDetail /></ProtectedRoute>} />
          <Route path="/drives" element={<ProtectedRoute><DriveList /></ProtectedRoute>} />
          <Route path="/drives/:id" element={<ProtectedRoute><DriveDetail /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><RewardList /></ProtectedRoute>} />
          <Route path="/rewards/:id" element={<ProtectedRoute><RewardDetail /></ProtectedRoute>} />
          <Route path="/ai/eligibility" element={<ProtectedRoute><AIEligibility /></ProtectedRoute>} />
          <Route path="/ai/expiration" element={<ProtectedRoute><AIExpiration /></ProtectedRoute>} />
          <Route path="/ai/campaign" element={<ProtectedRoute><AICampaign /></ProtectedRoute>} />
          <Route path="/ai/reengagement" element={<ProtectedRoute><AIReengagement /></ProtectedRoute>} />
          <Route path="/ai/forecast" element={<ProtectedRoute><AIForecast /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
