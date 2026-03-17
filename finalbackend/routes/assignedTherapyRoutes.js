
import express from "express";
import { auth, permit } from "../middleware/auth.js";
import { 
  getPatientPrescriptions, 
  getMyTherapies, 
  getTherapistSchedule 
} from "../controllers/assignedTherapistController.js"; 

const router = express.Router();

router.get("/my", auth, getMyTherapies);


router.get(
  "/therapist/schedule", 
  auth, 
  permit(["therapist"]), 
  getTherapistSchedule
);

router.get("/patients/:id", auth, getPatientPrescriptions);

export default router;