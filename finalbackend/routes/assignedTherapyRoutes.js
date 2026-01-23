import express from "express";
import { auth } from "../middleware/auth.js";
// ✅ Updated import to include getMyTherapies and fix filename if needed
import { getPatientPrescriptions, getMyTherapies } from "../controllers/assignedTherapistController.js"; 

const router = express.Router();

/**
 * GET current logged-in patient's assigned therapies
 * ✅ MUST come before /patients/:id to avoid "my" being treated as an ID
 */
router.get("/my", auth, getMyTherapies);

/**
 * GET assigned therapies for a specific patient (Admin/Doctor use)
 */
router.get(
  "/patients/:id",
  auth,
  getPatientPrescriptions
);

export default router;