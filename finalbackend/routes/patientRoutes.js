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

import { upload } from "../config/cloudinary.js"; 

const router = express.Router();

/* ===========================
   🔹 Standard CRUD Routes
=========================== */
router.get("/", auth, permit([ "therapist"]), list);
router.get("/:id", auth, getOne);
router.post("/", create);
router.put("/:id", auth, update);

/* ===========================
   🔹 Profile Completion APIs (With File Upload)
=========================== */

router.get("/profile/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  UPDATE PROFILE + UPLOAD (Image & PDF)
router.put(
  "/profile/:id",
  upload.fields([
    { name: "profilePic", maxCount: 1 }, 
    { name: "prescriptions", maxCount: 5 } 
  ]),
  async (req, res) => {
    try {
      const updateData = { ...req.body, profileStatus: "completed" };

      // 1. Handle Profile Picture
      if (req.files && req.files["profilePic"]) {
        updateData.profilePic = req.files["profilePic"][0].path; // Cloudinary URL
      }

      // 2. Handle Prescriptions (PDFs)
      if (req.files && req.files["prescriptions"]) {
        
        // Yahan hum naye URLs ka array bana rahe hain
        const newDocs = req.files["prescriptions"].map((file) => file.path);
        
        // Agar database me push karna hai ($addToSet use karein taaki duplicate na ho)
        
        updateData.prescriptionDetails = { 
           ...(updateData.prescriptionDetails || {}), 
           documents: newDocs 
        };
      }

      // 3. Update Database
      const updated = await Patient.findByIdAndUpdate(
        req.params.id,
        
        
        { $set: updateData },
        { new: true }
      );

      if (!updated)
        return res.status(404).json({ message: "Patient not found" });

      res.json({
        message: "Profile updated successfully with files",
        patient: updated
      });
    } catch (err) {
      console.error("Error updating patient:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;