import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import BookAppointment from './components/BookAppointment';
import './App.css';
import backgroundImage from './backgroundImg.png'; 
import logo from './logo.png'; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getRoleInGreek = (role) => {
    switch(role) {
      case 'ADMIN': return 'Διαχειριστής';
      case 'DOCTOR': return 'Γιατρός';
      case 'PATIENT': return 'Ασθενής';
      default: return role;
    }
  };

  if (loading) {
    return <div className="loading">Φόρτωση...</div>;
  }

  return (
    <div className="App" style={{ 
      backgroundImage: `url(${backgroundImage})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat', 
      backgroundAttachment: 'fixed', 
      minHeight: '100vh', 
      margin: 0, 
      paddingBottom: '20px' 
    }}>
      <header className="app-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="Logo" style={{ height: '45px', width: 'auto' }} />
          Aegean Medical Center - Σύστημα Ραντεβού
        </h1>
        {user && (
          <div className="user-info">
            Καλώς ήρθατε, {user.firstName} {user.lastName} ({getRoleInGreek(user.role)})
            <button onClick={logout} className="logout-btn">Αποσύνδεση</button>
          </div>
        )}
      </header>

      <main>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/appointments" 
            element={user ? <Appointments user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/book" 
            element={user ? <BookAppointment user={user} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;