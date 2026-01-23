// finalbackend/models/Patient.js
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "patient" },

    personalDetails: {
      age: Number,
      gender: String,
      contactNumber: String
    },

    healthProfile: {
      prakritiType: String,
      doshaImbalance: String,
      allergies: String,
      medicalHistory: String
    },

    prescriptionDetails: {
  hasPrescription: { type: Boolean, default: false },

  therapies: [
    {
      therapy: { type: String, required: true },
      duration: { type: String, required: true }
    }
  ]
},

    // <-- ADD THESE REFERENCE FIELDS
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
    assignedTherapists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Therapist' }],


    // optionally store arrays if multiple:
    // assignedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
    // assignedTherapists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Therapist" }],

    profileStatus: {
      type: String,
      enum: ["incomplete", "completed"],
      default: "incomplete"
    },

    registrationTimestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
