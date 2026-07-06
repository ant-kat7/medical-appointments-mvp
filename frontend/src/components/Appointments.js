import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Appointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Αποτυχία ανάκτησης ραντεβού');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτό το ραντεβού;')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/appointments/${id}`, { status: 'CANCELLED' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh appointments
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.error || 'Αποτυχία ακύρωσης ραντεβού');
    }
  };

  const getStatusBadge = (status) => {
    const className = `status-badge status-${status.toLowerCase()}`;
    const statusInGreek = {
      'BOOKED': 'ΕΝΕΡΓΟ',
      'CANCELLED': 'ΑΚΥΡΩΜΕΝΟ',
      'COMPLETED': 'ΟΛΟΚΛΗΡΩΜΕΝΟ',
      'PENDING': 'ΕΚΚΡΕΜΕΣ'
    };
    return <span className={className}>{statusInGreek[status] || status}</span>;
  };

  if (loading) return <div>Φόρτωση ραντεβού...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Ραντεβού</h2>
        <div className="page-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            Επιστροφή στον Πίνακα Ελέγχου
          </Link>
          {user.role !== 'DOCTOR' && (
            <Link to="/book" className="btn">Νέο Ραντεβού</Link>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {appointments.length === 0 ? (
        <div className="card">
          <p>Δεν βρέθηκαν ραντεβού.</p>
          {user.role !== 'DOCTOR' && (
            <Link to="/book" className="btn">Νέο Ραντεβού</Link>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ημερομηνία & Ώρα</th>
                  <th>Ασθενής</th>
                  {user.role === 'ADMIN' && <th>Γιατρός</th>}
                  <th>Λόγος</th>
                  <th>Κατάσταση</th>
                  <th>Ενέργειες</th>
                </tr>
              </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    {new Date(appointment.start_time).toLocaleDateString('el-GR')}<br />
                    <small>{new Date(appointment.start_time).toLocaleTimeString('el-GR')}</small>
                  </td>
                  <td>
                    <strong>{appointment.patient_name}</strong><br />
                    <small>{appointment.patient_email}</small>
                  </td>
                  {user.role === 'ADMIN' && (
                    <td>
                      Δρ. {appointment.doctor_name} {appointment.doctor_surname}<br />
                      <small>{appointment.specialty}</small>
                    </td>
                  )}
                  <td>{appointment.reason || 'Δεν αναφέρθηκε λόγος'}</td>
                  <td>{getStatusBadge(appointment.status)}</td>
                  <td>
                    {appointment.status === 'BOOKED' && (
                      <button 
                        onClick={() => cancelAppointment(appointment.id)}
                        className="btn btn-danger"
                        style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                      >
                        Ακύρωση
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {user.role === 'ADMIN' && (
        <div className="grid grid-cols-3" style={{ marginTop: '2rem' }}>
          <div className="card dashboard-stats">
            <h3>Συνολικά Ραντεβού</h3>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#2563eb' }}>
              {appointments.length}
            </p>
          </div>
          <div className="card dashboard-stats">
            <h3>Ενεργά</h3>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#059669' }}>
              {appointments.filter(a => a.status === 'BOOKED').length}
            </p>
          </div>
          <div className="card dashboard-stats">
            <h3>Ακυρωμένα</h3>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#dc2626' }}>
              {appointments.filter(a => a.status === 'CANCELLED').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;