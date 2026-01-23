import express from "express";
import { auth, permit } from "../middleware/auth.js";
import { list, getOne, create, update, updateProfile } from "../controllers/therapistController.js";
import { getAcceptedPatientsForTherapist } from "../controllers/therapistExtraController.js";

const router = express.Router();

router.get("/", list);

// therapist's patients (accepted) ✅ MUST BE ABOVE /:id
router.get(
  "/:id/patients",
  auth,
  permit(["therapist", "doctor", "admin"]),
  getAcceptedPatientsForTherapist
);

// profile routes
router.get("/profile/:id", auth, getOne);
router.get("/:id", auth, getOne);

router.post("/", create);
router.put("/:id", auth, update);
router.put("/profile/:id", auth, updateProfile);

export default router;
