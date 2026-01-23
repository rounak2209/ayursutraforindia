import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  patientName: String,
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist' },
  therapy: String,
  rating: Number,
  feedback: String,
  concerns: String,
  status: { type: String, enum: ['pending','urgent','reviewed'], default: 'pending' },
  doctorResponse: String,
  therapistInstructions: String,
  feedbackDate: { type: Date, default: Date.now }
});

export default mongoose.model('Feedback', feedbackSchema);
