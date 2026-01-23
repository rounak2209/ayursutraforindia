// finalbackend/models/ProgressResponse.js
import mongoose from "mongoose";

const progressResponseSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Therapist",
    required: true
  },
  therapyType: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dateString: {
    type: String,
    required: true
  },
  questions: [
    {
      text: { type: String, required: true },
      maxScore: { type: Number, required: true },
      answer: { type: Number, default: null }
    }
  ],
  percentage: {
    type: Number,
    default: 0
  }
});

// 🔴 REMOVED unique:true constraint.
// This allows multiple question sets to be stored for the same patient/day.
progressResponseSchema.index({ patientId: 1, therapyType: 1, dateString: 1 });

export default mongoose.model("ProgressResponse", progressResponseSchema);