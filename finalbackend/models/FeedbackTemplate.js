import mongoose from 'mongoose';

const templateQuestionSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['scale', 'binary', 'text'], default: 'scale' },
  text: String
});

const feedbackTemplateSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  
  // General Questions (Autofilled for everyone)
  generalQuestions: [templateQuestionSchema],
  
  // Therapy Specific (Autofilled based on selection)
  // Structure: { "Vamana": [questions...], "Basti": [questions...] }
  therapyQuestions: {
    type: Map,
    of: [templateQuestionSchema]
  }
});

export default mongoose.model('FeedbackTemplate', feedbackTemplateSchema);