// finalbackend/models/Progress.js
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  value: { type: Number, required: true }
}, { _id: false });

const progressSchema = new mongoose.Schema({
  assignedTherapyId: { type: mongoose.Schema.Types.ObjectId, ref: "AssignedTherapy", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  dateString: { type: String, required: true }, // YYYY-MM-DD
  answers: { type: [answerSchema], default: [] },
  totalScore: { type: Number, required: true },
  maxScore: { type: Number, required: true }
}, { timestamps: true });

// Ensure one entry per therapy+patient+date (prevent double submissions)
progressSchema.index({ assignedTherapyId: 1, patientId: 1, dateString: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
