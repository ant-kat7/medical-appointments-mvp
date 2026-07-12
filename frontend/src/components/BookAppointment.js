import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function BookAppointment({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctors`);
      setDoctors(response.data);
    } catch (err) {
      setError('Αποτυχία ανάκτησης γιατρών');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const startTime = `${appointmentDate}T${appointmentTime}:00`;
      
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/appointments`, {
        doctorId: selectedDoctor,
        patientName,
        patientEmail,
        startTime,
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Το ραντεβού έκλεισε με επιτυχία!');
      
      // Clear form
      setSelectedDoctor('');
      setPatientName('');
      setPatientEmail('');
      setAppointmentDate('');
      setAppointmentTime('');
      setReason('');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Αποτυχία κλεισίματος ραντεβού');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      if (hour === 12) continue; // Skip lunch hour
      
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Νέο Ραντεβού</h2>
        <div className="page-actions">
          <Link to="/appointments" className="btn btn-secondary">
            Επιστροφή στα Ραντεβού
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      <div className="card booking-form">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label htmlFor="patientName">Όνομα Ασθενούς:</label>
              <input
                type="text"
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="patientEmail">Email Ασθενούς:</label>
              <input
                type="email"
                id="patientEmail"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="selectedDoctor">Γιατρός:</label>
            <select
              id="selectedDoctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
            >
              <option value="">Επιλέξτε γιατρό</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Δρ. {doctor.first_name} {doctor.last_name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label htmlFor="appointmentDate">Ημερομηνία:</label>
              <input
                type="date"
                id="appointmentDate"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointmentTime">Ώρα:</label>
              <select
                id="appointmentTime"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              >
                <option value="">Επιλέξτε ώρα</option>
                {generateTimeSlots().map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Λόγος επίσκεψης:</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
              placeholder="Σύντομη περιγραφή του λόγου της επίσκεψής σας..."
            />
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Φόρτωση...' : 'Νέο ραντεβού'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookAppointment;