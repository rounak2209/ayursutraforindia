// routes/requestRoutes.js
import express from "express";
import { auth, permit } from "../middleware/auth.js";
import { createRequest, listRequests, acceptRequest, rejectRequest ,getAcceptedRequestsForPatient } from "../controllers/requestController.js";
import { patientsForTherapist } from "../controllers/requestController.js";

const router = express.Router();

// patient creates request
router.post("/", auth, createRequest);

// therapist/doctor fetch requests
router.get("/", auth, permit(["therapist", "doctor", "admin"]), listRequests);

// therapist/doctor accept/reject
router.put("/:id/accept", auth, permit(["therapist", "doctor", "admin"]), acceptRequest);
router.put("/:id/reject", auth, permit(["therapist", "doctor", "admin"]), rejectRequest);

router.get(
  "/patient/:id",
  auth,
  getAcceptedRequestsForPatient
);
router.get(
  "/therapists/:id/patients",
  auth,            // therapist must be logged in
  patientsForTherapist
);



export default router;
