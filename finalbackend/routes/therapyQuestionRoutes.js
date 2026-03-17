
import express from "express";
import { auth } from "../middleware/auth.js";
import {
  saveTherapyQuestions,
  getMyTherapyQuestions,
  getTherapyQuestions
} from "../controllers/therapyQuestionController.js";

const router = express.Router();

router.post("/", auth, saveTherapyQuestions);
router.get("/my", auth, getMyTherapyQuestions);
router.get("/:therapyType", auth, getTherapyQuestions);

export default router;
