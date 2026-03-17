
import express from "express";
import { auth } from "../middleware/auth.js";
import { submitProgress, getTherapyProgress, getPatientProgress } from "../controllers/progressController.js";

const router = express.Router();

// router.post("/submit", auth, submitProgress);
router.get("/therapy/:assignedTherapyId", auth, getTherapyProgress);
router.get("/patient/:patientId", auth, getPatientProgress);

export default router;
