import express from "express";
import { auth, permit } from "../middleware/auth.js";
import {
  list,
  getOne,
  create,
  update,
  remove
} from "../controllers/patientController.js";
import Patient from "../models/Patient.js";

const router = express.Router();

/* ===========================
   🔹 Standard CRUD Routes
=========================== */

// Doctors/Therapists can view all patients
router.get("/", auth, permit(["doctor", "therapist"]), list);

// Get single patient (authenticated)
router.get("/:id", auth, getOne);

// Create new patient (used during registration)
router.post("/", create);

// Update patient (authenticated)
router.put("/:id", auth, update);

// Delete patient (doctor only)
router.delete("/:id", auth, permit(["doctor"]), remove);

/* ===========================
   🔹 Profile Completion APIs
=========================== */

// ✅ Fetch patient profile by ID (for dashboard load)
router.get("/profile/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient)
      return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update or complete profile
router.put("/profile/:id", async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...req.body, profileStatus: "completed" },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Patient not found" });
    res.json({
      message: "Profile updated successfully",
      patient: updated
    });
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
