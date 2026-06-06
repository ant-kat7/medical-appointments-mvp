import { PrismaClient, UserRole, AppointmentStatus, WaitlistStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create specialties
  const specialties = await Promise.all([
    prisma.specialty.create({
      data: {
        name: 'General Practice',
        description: 'Primary care and general medical services',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Cardiology',
        description: 'Heart and cardiovascular system',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Dermatology',
        description: 'Skin, hair, and nail conditions',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Orthopedics',
        description: 'Bones, joints, and musculoskeletal system',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Pediatrics',
        description: 'Medical care for infants, children, and adolescents',
      },
    }),
  ]);

  console.log('Created specialties');

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1-555-0001',
    },
  });

  console.log('Created admin user');

  // Create doctor users
  const doctorUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'dr.smith@test.com',
        passwordHash: await bcrypt.hash('doctor123', 10),
        role: UserRole.DOCTOR,
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1-555-0101',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dr.johnson@test.com',
        passwordHash: await bcrypt.hash('doctor123', 10),
        role: UserRole.DOCTOR,
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1-555-0102',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dr.williams@test.com',
        passwordHash: await bcrypt.hash('doctor123', 10),
        role: UserRole.DOCTOR,
        firstName: 'Michael',
        lastName: 'Williams',
        phone: '+1-555-0103',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dr.brown@test.com',
        passwordHash: await bcrypt.hash('doctor123', 10),
        role: UserRole.DOCTOR,
        firstName: 'Emily',
        lastName: 'Brown',
        phone: '+1-555-0104',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dr.davis@test.com',
        passwordHash: await bcrypt.hash('doctor123', 10),
        role: UserRole.DOCTOR,
        firstName: 'Robert',
        lastName: 'Davis',
        phone: '+1-555-0105',
      },
    }),
  ]);

  // Create doctors
  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        userId: doctorUsers[0].id,
        licenseNumber: 'MD001',
        specialtyId: specialties[0].id, // General Practice
        department: 'Primary Care',
        bio: 'Experienced general practitioner with 15 years in family medicine.',
      },
    }),
    prisma.doctor.create({
      data: {
        userId: doctorUsers[1].id,
        licenseNumber: 'MD002',
        specialtyId: specialties[1].id, // Cardiology
        department: 'Cardiology',
        bio: 'Board-certified cardiologist specializing in preventive cardiology.',
      },
    }),
    prisma.doctor.create({
      data: {
        userId: doctorUsers[2].id,
        licenseNumber: 'MD003',
        specialtyId: specialties[2].id, // Dermatology
        department: 'Dermatology',
        bio: 'Dermatologist with expertise in both medical and cosmetic dermatology.',
      },
    }),
    prisma.doctor.create({
      data: {
        userId: doctorUsers[3].id,
        licenseNumber: 'MD004',
        specialtyId: specialties[3].id, // Orthopedics
        department: 'Orthopedics',
        bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement.',
      },
    }),
    prisma.doctor.create({
      data: {
        userId: doctorUsers[4].id,
        licenseNumber: 'MD005',
        specialtyId: specialties[4].id, // Pediatrics
        department: 'Pediatrics',
        bio: 'Pediatrician dedicated to providing comprehensive care for children.',
      },
    }),
  ]);

  console.log('Created doctors');

  // Create availability for doctors (typical working hours)
  const availabilityData = [];
  for (const doctor of doctors) {
    // Monday to Friday, 9 AM to 5 PM
    for (let day = 1; day <= 5; day++) {
      availabilityData.push({
        doctorId: doctor.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMins: 30,
        exceptions: {
          breaks: [
            { start: '12:00', end: '13:00' }, // Lunch break
          ],
        },
      });
    }
  }

  await prisma.availability.createMany({
    data: availabilityData,
  });

  console.log('Created doctor availability');

  // Create patient users
  const patientNames = [
    { first: 'Alice', last: 'Johnson' },
    { first: 'Bob', last: 'Miller' },
    { first: 'Carol', last: 'Wilson' },
    { first: 'David', last: 'Moore' },
    { first: 'Emma', last: 'Taylor' },
    { first: 'Frank', last: 'Anderson' },
    { first: 'Grace', last: 'Thomas' },
    { first: 'Henry', last: 'Jackson' },
    { first: 'Iris', last: 'White' },
    { first: 'Jack', last: 'Harris' },
    { first: 'Karen', last: 'Martin' },
    { first: 'Liam', last: 'Thompson' },
    { first: 'Maya', last: 'Garcia' },
    { first: 'Noah', last: 'Martinez' },
    { first: 'Olivia', last: 'Robinson' },
  ];

  const patientUsers = [];
  for (let i = 0; i < 15; i++) {
    const name = patientNames[i];
    const user = await prisma.user.create({
      data: {
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@test.com`,
        passwordHash: await bcrypt.hash('patient123', 10),
        role: UserRole.PATIENT,
        firstName: name.first,
        lastName: name.last,
        phone: `+1-555-${(1000 + i).toString()}`,
      },
    });
    patientUsers.push(user);
  }

  // Create patients
  const patients = [];
  for (let i = 0; i < patientUsers.length; i++) {
    const patient = await prisma.patient.create({
      data: {
        userId: patientUsers[i].id,
        mrnFake: `MRN${(10000 + i).toString()}`,
        dobFake: new Date(1990 - i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: `${100 + i} Main St, Test City, TC ${10000 + i}`,
        emergencyContact: `Emergency Contact ${i + 1}`,
        allergies: i < 5 ? 'No known allergies' : null,
      },
    });
    patients.push(patient);
  }

  console.log('Created patients');

  // Create demo appointments for the next 2 weeks
  const appointments = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  for (let day = 0; day < 14; day++) {
    const appointmentDate = new Date(startDate);
    appointmentDate.setDate(startDate.getDate() + day);
    
    // Skip weekends
    if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
      continue;
    }

    // Create 3-5 random appointments per doctor per day
    for (const doctor of doctors) {
      const appointmentCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < appointmentCount; i++) {
        const hour = 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
        const minute = Math.random() < 0.5 ? 0 : 30;
        
        // Skip lunch hour
        if (hour === 12) continue;

        const startTime = new Date(appointmentDate);
        startTime.setHours(hour, minute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);

        // Random patient
        const patient = patients[Math.floor(Math.random() * patients.length)];
        
        // Random status (mostly booked, some completed, few cancelled)
        let status: AppointmentStatus = AppointmentStatus.BOOKED;
        const random = Math.random();
        if (day < 7) { // Past appointments
          status = random < 0.8 ? AppointmentStatus.COMPLETED : 
                   random < 0.9 ? AppointmentStatus.CANCELLED : AppointmentStatus.NO_SHOW;
        } else { // Future appointments
          status = random < 0.9 ? AppointmentStatus.BOOKED : AppointmentStatus.CANCELLED;
        }

        const reasons = [
          'Regular checkup',
          'Follow-up visit',
          'Consultation',
          'Annual physical',
          'Vaccination',
          'Lab results review',
        ];

        try {
          appointments.push(await prisma.appointment.create({
            data: {
              doctorId: doctor.id,
              patientId: patient.id,
              startTime,
              endTime,
              status,
              reason: reasons[Math.floor(Math.random() * reasons.length)],
              notes: status === AppointmentStatus.COMPLETED ? 'Visit completed successfully. Patient doing well.' : null,
            },
          }));
        } catch (error) {
          // Skip if appointment slot already exists (duplicate prevention)
          continue;
        }
      }
    }
  }

  console.log(`Created ${appointments.length} appointments`);

  // Create some waitlist entries
  const waitlists = [];
  for (let i = 0; i < 10; i++) {
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const patient = patients[Math.floor(Math.random() * patients.length)];
    
    const desiredStart = new Date();
    desiredStart.setDate(desiredStart.getDate() + Math.floor(Math.random() * 7) + 1);
    desiredStart.setHours(9, 0, 0, 0);
    
    const desiredEnd = new Date(desiredStart);
    desiredEnd.setDate(desiredEnd.getDate() + 7);
    desiredEnd.setHours(17, 0, 0, 0);

    try {
      waitlists.push(await prisma.waitlist.create({
        data: {
          doctorId: doctor.id,
          patientId: patient.id,
          desiredRangeStart: desiredStart,
          desiredRangeEnd: desiredEnd,
          priority: Math.floor(Math.random() * 5),
          reason: 'Urgent consultation needed',
          status: WaitlistStatus.ACTIVE,
        },
      }));
    } catch (error) {
      // Skip if waitlist entry already exists
      continue;
    }
  }

  console.log(`Created ${waitlists.length} waitlist entries`);

  // Create some audit log entries
  const auditLogs = [];
  for (let i = 0; i < 50; i++) {
    const user = [...doctorUsers, ...patientUsers, adminUser][Math.floor(Math.random() * (doctorUsers.length + patientUsers.length + 1))];
    const actions = ['LOGIN', 'LOGOUT', 'CREATE_APPOINTMENT', 'CANCEL_APPOINTMENT', 'UPDATE_PROFILE'];
    const entityTypes = ['User', 'Appointment', 'Availability', 'Waitlist'];
    
    auditLogs.push(await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: actions[Math.floor(Math.random() * actions.length)],
        entityType: entityTypes[Math.floor(Math.random() * entityTypes.length)],
        entityId: appointments[Math.floor(Math.random() * appointments.length)]?.id || null,
        metadata: {
          additionalInfo: 'Demo audit log entry',
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 Demo Browser',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Last 7 days
      },
    }));
  }

  console.log(`Created ${auditLogs.length} audit log entries`);

  console.log('Database seeded successfully!');
  console.log('\nDemo Credentials:');
  console.log('Admin: admin@test.com / admin123');
  console.log('Doctor: dr.smith@test.com / doctor123');
  console.log('Patient: alice.johnson@test.com / patient123');
  console.log('\nSummary:');
  console.log(`- ${specialties.length} specialties`);
  console.log(`- ${doctors.length} doctors`);
  console.log(`- ${patients.length} patients`);
  console.log(`- ${appointments.length} appointments`);
  console.log(`- ${waitlists.length} waitlist entries`);
  console.log(`- ${auditLogs.length} audit log entries`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });