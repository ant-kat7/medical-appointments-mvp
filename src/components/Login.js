import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Quick-login buttons are a testing/demo convenience only. They are disabled by
// default in production builds and can be force-enabled via configuration.
const DEMO_LOGIN_ENABLED =
  process.env.REACT_APP_ENABLE_DEMO_LOGIN === 'true' ||
  process.env.NODE_ENV !== 'production';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Αποτυχία σύνδεσης');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h2>Σύνδεση στο Σύστημα Ιατρικών Ραντεβού</h2>
      
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Κωδικός Πρόσβασης:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Σύνδεση...' : 'Σύνδεση'}
        </button>
      </form>

      {DEMO_LOGIN_ENABLED && (
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Δοκιμαστικοί Λογαριασμοί:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loginAsDemo('admin@test.com', 'admin123')}
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          >
            Σύνδεση ως Διαχειριστής
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loginAsDemo('dr.smith@test.com', 'doctor123')}
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          >
            Σύνδεση ως Γιατρός
          </button>
        </div>
      </div>
      )}
    </div>
    </div>
  );
}

export default Login;