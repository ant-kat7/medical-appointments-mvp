const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const { format, addDays, parseISO } = require('date-fns');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';

// Database setup
const db = new sqlite3.Database(':memory:');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Doctors table
  db.run(`CREATE TABLE doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    specialty TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Appointments table
  db.run(`CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    patient_email TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status TEXT DEFAULT 'BOOKED',
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
  )`);

  // Insert demo data
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const doctorPassword = bcrypt.hashSync('doctor123', 10);

  db.run(`INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES 
    ('admin@test.com', ?, 'ADMIN', 'Admin', 'User'),
    ('dr.smith@test.com', ?, 'DOCTOR', 'John', 'Smith')`, 
    [adminPassword, doctorPassword]);

  db.run(`INSERT INTO doctors (user_id, specialty) VALUES (2, 'General Practice')`);

  // Add some demo appointments
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  db.run(`INSERT INTO appointments (doctor_id, patient_email, patient_name, start_time, end_time, reason) VALUES 
    (1, 'patient1@test.com', 'Alice Johnson', ?, ?, 'Regular checkup'),
    (1, 'patient2@test.com', 'Bob Smith', ?, ?, 'Follow-up')`,
    [format(today, 'yyyy-MM-dd HH:mm:ss'), format(addDays(today, 0), 'yyyy-MM-dd HH:mm:ss'),
     format(tomorrow, 'yyyy-MM-dd HH:mm:ss'), format(tomorrow, 'yyyy-MM-dd HH:mm:ss')]);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  });
});

// Appointments routes
app.get('/appointments', authenticateToken, (req, res) => {
  let query = `
    SELECT a.*, d.specialty, u.first_name as doctor_name, u.last_name as doctor_surname
    FROM appointments a 
    JOIN doctors d ON a.doctor_id = d.id 
    JOIN users u ON d.user_id = u.id
  `;
  
  const params = [];

  if (req.user.role === 'DOCTOR') {
    query += ' WHERE d.user_id = ?';
    params.push(req.user.id);
  }

  db.all(query, params, (err, appointments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(appointments);
  });
});

app.post('/appointments', authenticateToken, (req, res) => {
  const { doctorId, patientEmail, patientName, startTime, reason } = req.body;

  if (!doctorId || !patientEmail || !patientName || !startTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const start = parseISO(startTime);
  const end = addDays(start, 0);
  end.setMinutes(end.getMinutes() + 30); // 30-minute appointments

  db.run(
    `INSERT INTO appointments (doctor_id, patient_email, patient_name, start_time, end_time, reason) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [doctorId, patientEmail, patientName, start.toISOString(), end.toISOString(), reason || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create appointment' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Appointment created successfully'
      });
    }
  );
});

// Partial update of an appointment (e.g. status change). The operation is expressed
// through the request body, not the URL, following REST resource semantics.
const APPOINTMENT_STATUSES = ['BOOKED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];

app.patch('/appointments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !APPOINTMENT_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing status' });
  }

  db.run(
    'UPDATE appointments SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update appointment' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json({ message: `Appointment updated to ${status}` });
    }
  );
});

// Doctors routes
app.get('/doctors', (req, res) => {
  db.all(`
    SELECT d.id, d.specialty, u.first_name, u.last_name, u.email
    FROM doctors d 
    JOIN users u ON d.user_id = u.id
  `, (err, doctors) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(doctors);
  });
});

// Available slots for a doctor (simplified - just returns some sample slots)
app.get('/doctors/:id/slots', (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date parameter required' });
  }

  // Generate sample available slots for demo
  const slots = [];
  const baseDate = parseISO(date);
  
  for (let hour = 9; hour < 17; hour++) {
    if (hour === 12) continue; // Skip lunch hour
    
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTime = new Date(baseDate);
      slotTime.setHours(hour, minute, 0, 0);
      
      slots.push({
        time: slotTime.toISOString(),
        available: Math.random() > 0.3 // 70% chance of being available
      });
    }
  }

  res.json(slots);
});

// Reports route (simplified)
app.get('/reports/summary', authenticateToken, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all(`
    SELECT 
      COUNT(*) as total_appointments,
      COUNT(CASE WHEN status = 'BOOKED' THEN 1 END) as booked_appointments,
      COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_appointments,
      COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_appointments
    FROM appointments
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const stats = results[0];
    const cancellationRate = stats.total_appointments > 0 
      ? (stats.cancelled_appointments / stats.total_appointments * 100).toFixed(2)
      : 0;

    res.json({
      ...stats,
      cancellation_rate: `${cancellationRate}%`
    });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`👨‍⚕️ Demo credentials:`);
    console.log(`   Admin: admin@test.com / admin123`);
    console.log(`   Doctor: dr.smith@test.com / doctor123`);
  });
}

module.exports = app;