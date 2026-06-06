import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ user }) {
  const getRoleInGreek = (role) => {
    switch(role) {
      case 'ADMIN': return 'Διαχειριστής';
      case 'DOCTOR': return 'Γιατρός';
      case 'PATIENT': return 'Ασθενής';
      default: return role;
    }
  };

  return (
    <div>
      <h2>Πίνακας Ελέγχου</h2>
      
      <div className="nav-links">
        <Link to="/appointments">Προβολή Ραντεβού</Link>
        {user.role !== 'DOCTOR' && <Link to="/book">Νέο Ραντεβού</Link>}
      </div>

      <div className="grid grid-cols-3">
        <div className="card">
          <h3>Καλώς ήρθατε, {user.firstName}!</h3>
          <p>Ρόλος: <strong>{getRoleInGreek(user.role)}</strong></p>
          <p>Email: {user.email}</p>
        </div>

        <div className="card dashboard-stats">
          <h3>Δεδομένα:</h3>
          <p>🗓️ Σημερινή Ημερομηνία: {new Date().toLocaleDateString('el-GR')}</p>
          <p>👥 Ρόλος: {getRoleInGreek(user.role)}</p>
          {user.role === 'DOCTOR' && <p>🏥 Ειδικότητα: Γενική Ιατρική</p>}
        </div>

        <div className="card">
          <h3>Γρήγορες Ενέργειες</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/appointments" className="btn">Προβολή Ραντεβού</Link>
            {user.role !== 'DOCTOR' && (
              <Link to="/book" className="btn btn-secondary">Νέο Ραντεβού</Link>
            )}
          </div>
        </div>
      </div>

      {user.role === 'ADMIN' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Λειτουργίες Διαχειριστή</h3>
          <p>Ως διαχειριστής, έχετε πρόσβαση σε:</p>
          <ul>
            <li>Προβολή όλων των ραντεβού του συστήματος</li>
            <li>Δημιουργία αναφορών και αναλυτικών στοιχείων</li>
            <li>Διαχείριση ρυθμίσεων συστήματος</li>
          </ul>
        </div>
      )}

      {user.role === 'DOCTOR' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Λειτουργίες Γιατρού</h3>
          <p>Ως γιατρός, μπορείτε να:</p>
          <ul>
            <li>Δείτε τα προγραμματισμένα ραντεβού σας</li>
            <li>Ενημερώσετε την κατάσταση των ραντεβού</li>
            <li>Διαχειριστείτε τη διαθεσιμότητά σας</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;