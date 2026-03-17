import express from "express";
import { auth, permit } from "../middleware/auth.js";
import {
  sendQuestions,
  getTodaysQuestions,
  submitAnswers
} from "../controllers/progressResponseController.js";

const router = express.Router();

// Therapist sends today's questions to a patient
// router.post("/send", auth, permit(["therapist"]), sendQuestions);

// Patient fetches today's questions
router.get("/today", auth, permit(["patient"]), getTodaysQuestions);

// Patient submits answers for a specific daily response
router.put("/:id", auth, permit(["patient"]), submitAnswers);

export default router;
