import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: String, // unique ID for the question field
  category: { type: String, enum: ['general', 'therapy', 'custom'], default: 'custom' },
  type: { type: String, enum: ['scale', 'binary', 'text', 'tags'], default: 'text' },
  text: String,
  options: [String], // for tags or multiple choice
  answer: mongoose.Schema.Types.Mixed // can be number, string, or boolean
});

const feedbackSessionSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  
  // The structure of the feedback form
  questions: [questionSchema],
  
  // Patient's additional unstructured input
  patientNotes: String, // "Additional symptoms or side effects"
  
  // Timestamps
  sentAt: { type: Date, default: Date.now },
  respondedAt: Date
});

export default mongoose.model('FeedbackSession', feedbackSessionSchema);