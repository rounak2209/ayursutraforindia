import mongoose from 'mongoose';

const therapistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specializations: [String],
    experience: Number,
    location: String,
    workingDays: [String],
    startTime: String,
    endTime: String,
    phone: String,
    money: { type: String, default: "0" },
    bio: String,
    sessionDuration: {
    type: Number, // minutes
    default: 60
    },
    unavailableDates: {
  type: [String],
  default: []
  },

    profileStatus: {
      type: String,
      enum: ["incomplete", "completed"],
      default: "incomplete"
    }
  },
  { timestamps: true }
);

export default mongoose.model('Therapist', therapistSchema);
