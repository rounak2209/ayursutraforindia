import mongoose from "mongoose";

const assignedTherapySchema = new mongoose.Schema({
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
  therapy: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["scheduled", "ongoing", "completed"],
    default: "scheduled"
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  sessionFee: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("AssignedTherapy", assignedTherapySchema);
