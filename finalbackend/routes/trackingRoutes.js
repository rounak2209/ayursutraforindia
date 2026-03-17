
import express from "express";
import { auth, permit } from "../middleware/auth.js";
import { 
  getPendingActions, 
  submitProgress, 
  submitFeedback, 
  addVirechanaMotion,
  getAutomationSettings,
  updateAutomationSettings,
  toggleSessionStatus
} from "../controllers/trackingController.js";

const router = express.Router();

// Patient Logic
router.get("/status", auth, permit(['patient']), getPendingActions);
router.post("/progress", auth, permit(['patient']), submitProgress);
router.post("/feedback", auth, permit(['patient']), submitFeedback);
router.post("/virechana/add", auth, permit(['patient']), addVirechanaMotion);

// Therapist Logic
router.get("/settings", auth, permit(['therapist']), getAutomationSettings);
router.put("/settings", auth, permit(['therapist']), updateAutomationSettings);
router.post('/toggle-session', auth, permit(['therapist']), toggleSessionStatus);

export default router;