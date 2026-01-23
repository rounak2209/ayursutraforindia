import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ayurvedicRegistrationId: String,
  specifications: [String],
  availableDays: [String],
  timeSlots: String,
  charges: String,
  qualifications: String,
  experience: String,
  profileStatus: {
      type: String,
      enum: ["incomplete", "completed"],
      default: "incomplete"
    },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Doctor', doctorSchema);
