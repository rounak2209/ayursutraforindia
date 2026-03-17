
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
    type: Number, 
    required: true
  },
  
  bookedSlots: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    enum: ["scheduled", "ongoing", "completed", "cancelled"],
    default: "scheduled"
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  sessionFee: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
  lastSessionDate: { type: String, default: null }, 
  todaysSessionStatus: { 
    type: String, 
    enum: ['pending', 'started', 'completed'], 
    default: 'pending' 
  },
  lastSessionCompletedAt: { type: Date },
  completedDates: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("AssignedTherapy", assignedTherapySchema);