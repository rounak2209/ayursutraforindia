
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Patient from '../models/Patient.js';
import Therapist from '../models/Therapist.js';

dotenv.config();
const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN || '2h' });

export const register = async (req, res) => {
  try {
    const { name, email, password, role, extra } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
    const hashed = await bcrypt.hash(password, 10);

    if (role === 'patient') {
      if (await Patient.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
      const p = await Patient.create({ name, email, password: hashed, ...extra });
      return res.status(201).json({ message: 'Patient created', id: p._id, profileStatus: p.profileStatus || 'incomplete' });
    }
    if (role === 'therapist') {
      if (await Therapist.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
      const t = await Therapist.create({ name, email, password: hashed, ...extra });
      return res.status(201).json({ message: 'Therapist created', id: t._id, profileStatus: t.profileStatus || 'incomplete' });
    }
    return res.status(400).json({ message: 'Bad role' });
  } catch (err) {
    console.error("❌ Auth Error:", err.message); 
    return res.status(500).json({ message: "Server error occurred. Please try again." }); 
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase(); 
    const user =
  (await Patient.findOne({ email: cleanEmail })) ||
  (await Therapist.findOne({ email: cleanEmail }));
    
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    let role = 'patient';

    if (user.constructor && user.constructor.modelName === 'Therapist') role = 'therapist';

    const token = sign({ id: user._id, role });

    // include profileStatus and name to let frontend decide first-time flow without another request
    const profileStatus = user.profileStatus || 'incomplete';
    const name = user.name || '';

    res.json({
      message: 'Login ok',
      token,
      role,
      id: user._id,
      profileStatus,
      name
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
