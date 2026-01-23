// controllers/doctorController.js
import Doctor from '../models/Doctor.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Get list of doctors (for admin or public depending on your design)
export const list = async (req, res) => {
  try {
    const docs = await Doctor.find().select('-password'); // never return password
    return res.json(docs);
  } catch (err) {
    console.error('doctorController.list error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get single doctor by id
export const getOne = async (req, res) => {
  try {
    const d = await Doctor.findById(req.params.id).select('-password');
    if (!d) return res.status(404).json({ message: 'Not found' });
    return res.json(d);
  } catch (err) {
    console.error('doctorController.getOne error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create doctor (signup) - ensure you hash password and check duplicates
export const create = async (req, res) => {
  try {
    const { email, password, name, ...rest } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // duplicate email check
    const exists = await Doctor.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const newDoctor = await Doctor.create({
      email,
      password: hashed,
      name: name || '',
      ...rest
    });

    return res.status(201).json({ id: newDoctor._id });
  } catch (err) {
    console.error('doctorController.create error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Generic update: allows admin or owner. Prevents sensitive fields overwrite.
export const update = async (req, res) => {
  try {
    // Authorization: only allow owner (doctor) or admin to update
    // requires auth middleware to set req.user = { id, role }
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const targetId = req.params.id;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // only allow if requester is admin or they own the profile
    if (requesterRole !== 'admin' && requesterId !== targetId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Prevent clients from changing protected fields
    const forbidden = ['_id', 'id', 'role', 'email', 'password']; // email/password should be changed via dedicated endpoints
    const updates = {};
    Object.keys(req.body).forEach((k) => {
      if (!forbidden.includes(k)) updates[k] = req.body[k];
    });

    // If you want to allow email/password update, implement separate endpoints with validation + hashing

    const updated = await Doctor.findByIdAndUpdate(targetId, { $set: updates }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'Doctor not found' });

    return res.json(updated);
  } catch (err) {
    console.error('doctorController.update error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Specialized endpoint to update profile fields (less restrictive about allowed fields)
// but still protect sensitive changes. Accepts doctor-specific profile fields only.
export const updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const targetId = req.params.id;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (requesterRole !== 'admin' && requesterId !== targetId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // allow only specific profile fields
    const allowedFields = [
      'name',
      'ayurvedicRegistrationId',
      'specifications',
      'availableDays',
      'timeSlots',
      'charges',
      'experience',
      'qualifications',
      'profileStatus'
    ];

    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const updated = await Doctor.findByIdAndUpdate(
      targetId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'Doctor profile not found' });
    return res.json(updated);
  } catch (err) {
    console.error('doctorController.updateProfile error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
