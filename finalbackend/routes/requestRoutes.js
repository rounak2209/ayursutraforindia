
import express from "express";
import { auth, permit } from "../middleware/auth.js";
import {  listRequests } from "../controllers/requestController.js";
import { patientsForTherapist } from "../controllers/requestController.js";

const router = express.Router();


// therapist fetch requests
router.get("/", auth, permit(["therapist"]), listRequests);


router.get(
  "/therapists/:id/patients",
  auth,            
  patientsForTherapist
);



export default router;
