import mongoose from 'mongoose';

const therapistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    specializations: [String],
    therapyDurations: {
      type: Map,
      of: Number,
      default: {}
    },

    experience: Number,
    location: String,
    workingDays: [String],
    startTime: String,
    endTime: String,
    phone: String,
    money: { type: String, default: "0" },
    bio: String,
    sessionDuration: {
    type: Number, 
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
    ,
    automationSettings: {
    // Delay in minutes after session to send feedback form
    vamanaDelay: { type: Number, default: 120 },      
    virechanaDelay: { type: Number, default: 0 },     
    bastiDelay: { type: Number, default: 180 },       
    nasyaDelay: { type: Number, default: 30 },        
    raktamokshanaDelay: { type: Number, default: 240 },
    
    // Default morning check time (just for reference, logic runs on login)

    morningCheckTime: { type: String, default: "08:00" },
    morningCheckEnabled: { type: Boolean, default: true }
  }
  },
  { timestamps: true }
);

export default mongoose.model('Therapist', therapistSchema);
