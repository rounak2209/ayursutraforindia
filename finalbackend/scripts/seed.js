import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import bcrypt from 'bcryptjs';
import Therapist from '../models/Therapist.js';
import Patient from '../models/Patient.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  await Therapist.deleteMany();
  await Patient.deleteMany();

  const pwd = await bcrypt.hash('password123', 10);



  const t = await Therapist.create({
    name: 'Therapist Anju',
    email: 'therapist@local',
    password: pwd,
    therapyType: 'Virechana',
    specializations: ['Virechana'],
    workingDays: ['Monday','Tuesday']
  });

  const p = await Patient.create({
    name: 'Patient One',
    email: 'patient@local',
    password: pwd,
    phone: '9876543210',
    assignedTherapist: t._id
  });

  console.log('Seed done:', { therapist: t.email, patient: p.email });
  process.exit();
};

seed().catch(err => { console.error(err); process.exit(1); });
