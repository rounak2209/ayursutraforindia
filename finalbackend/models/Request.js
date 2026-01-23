// finalbackend/models/Request.js
import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  age: Number,
  address: String,
  therapyType: {
      type: String,
      default: null
    },
  therapyDuration: { type: String, default: null },
  requestDate: { type: Date, default: Date.now },
  appointmentDateString: { type: String, default: null },
  appointmentTime: { type: String, default: null },
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  urgency: { type: String, enum: ['low','moderate','high'], default: 'moderate' },
  sessionFee: { type: Number, default: 0 },
  notes: String,
  // IMPORTANT: store as refs so populate works
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', default: null },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
