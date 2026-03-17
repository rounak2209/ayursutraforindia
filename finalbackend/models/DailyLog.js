
import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: "Therapist", required: true },
  date: { type: Date, required: true }, 
  
  therapyType: { type: String, required: true },

  // 1. Morning Progress (General Health)
  progress: {
    isSubmitted: { type: Boolean, default: false },
    answers: [{ 
      questionId: String, 
      questionText: String, 
      answer: mongoose.Schema.Types.Mixed 
    }],
    submittedAt: Date
  },

  // 2. Post-Session Feedback (Safety/Experience)
  feedback: {
    isSubmitted: { type: Boolean, default: false },
    //  store the session ID that triggered this to prevent duplicates
    triggeredBySessionId: String, 
    answers: [{ 
      questionId: String, 
      questionText: String, 
      answer: mongoose.Schema.Types.Mixed,
    }],
    patientNotes: { type: String, default: "" }, 
    submittedAt: Date
  },

  // 3. Special: Virechana Real-Time Log
  virechanaLog: {
    isActive: { type: Boolean, default: false },
    motions: [{
      time: { type: Date, default: Date.now },
      quantity: String, 
      consistency: String,
      feeling: String
    }]
  }
}, { timestamps: true });


dailyLogSchema.index({ patientId: 1, date: 1, therapyType: 1 }, { unique: true });

export default mongoose.model("DailyLog", dailyLogSchema);