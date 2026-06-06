import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },  // ramp-up to 20 virtual users
    { duration: '1m', target: 50 },   // sustain 50 concurrent virtual users
    { duration: '30s', target: 0 },   // ramp-down
  ],
};

export default function () {
  // Test health endpoint
  let healthResponse = http.get('http://localhost:3001/health');
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test login
  let loginResponse = http.post('http://localhost:3001/auth/login', 
    JSON.stringify({
      email: 'admin@test.com',
      password: 'admin123'
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'login returns token': (r) => r.json('token') !== undefined,
  });

  if (loginResponse.status === 200) {
    const token = loginResponse.json('token');
    
    // Test appointments endpoint
    let appointmentsResponse = http.get('http://localhost:3001/appointments', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    check(appointmentsResponse, {
      'appointments status is 200': (r) => r.status === 200,
      'appointments response time < 300ms': (r) => r.timings.duration < 300,
    });
  }
}