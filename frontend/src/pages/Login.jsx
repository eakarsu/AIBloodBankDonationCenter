import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './Pages.css';

function Login() {
  const demoLoginLock = useRef(false);
  const [demoLoginBusy, setDemoLoginBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const performLogin = async (credentials) => {
    const res = await login(credentials.email, credentials.password);
    localStorage.setItem('token', res.data.token);
    navigate('/dashboard');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await performLogin({ email, password });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (demoLoginLock.current) return;
    demoLoginLock.current = true;
    setDemoLoginBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/demo-credentials', { cache: 'no-store' });
      if (!response.ok) throw new Error('Demo credentials are unavailable');
      const credentials = await response.json();
      if (!credentials.email || !credentials.password) throw new Error('Demo credentials are unavailable');
      setEmail(credentials.email);
      setPassword(credentials.password);
      await performLogin(credentials);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Demo login failed. Please try again.');
    } finally {
      demoLoginLock.current = false;
      setDemoLoginBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">&#x1F3E5;</div>
        <h1>Blood Bank Manager</h1>
        <p className="login-subtitle">AI-Powered Donation Center Management</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button type="button" className="btn btn-quick" onClick={handleDemoLogin} disabled={demoLoginBusy || loading}>
          {demoLoginBusy ? 'Signing in as Demo...' : 'Log In as Demo'}
        </button>
      </div>
    </div>
  );
}

export default Login;
