import mongoose from 'mongoose';

const templateQuestionSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['scale', 'binary', 'text'], default: 'scale' },
  text: String
});

const feedbackTemplateSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  
  
  generalQuestions: [templateQuestionSchema],
  
  
  
  therapyQuestions: {
    type: Map,
    of: [templateQuestionSchema],
    default: {}
  }
});

export default mongoose.model('FeedbackTemplate', feedbackTemplateSchema);