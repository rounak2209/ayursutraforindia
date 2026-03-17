import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: String, 
  category: { type: String, enum: ['general', 'therapy', 'custom'], default: 'custom' },
  type: { type: String, enum: ['scale', 'binary', 'text', 'tags'], default: 'text' },
  text: String,
  options: [String], 
  answer: mongoose.Schema.Types.Mixed 
});

const feedbackSessionSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  
  
  questions: [questionSchema],
  
  
  patientNotes: String, 
  
  
  sentAt: { type: Date, default: Date.now },
  respondedAt: Date
});

export default mongoose.model('FeedbackSession', feedbackSessionSchema);