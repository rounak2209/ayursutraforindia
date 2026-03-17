import express from "express";
import { auth, permit } from "../middleware/auth.js";
import { list, getOne, create, update, updateProfile } from "../controllers/therapistController.js";
import { getAcceptedPatientsForTherapist } from "../controllers/therapistExtraController.js";

import { upload } from "../config/cloudinary.js"; 

const router = express.Router();

router.get("/", list);

// therapist's patients (accepted)
router.get(
  "/:id/patients",
  auth,
  permit(["therapist"]),
  getAcceptedPatientsForTherapist
);

// profile routes
router.get("/profile/:id", auth, getOne);
router.get("/:id", auth, getOne);

router.post("/", create);
router.put("/:id", auth, update);

//  UPDATE PROFILE + UPLOAD (Profile Pic)

router.put(
    "/profile/:id", 
    auth, 
    upload.single('profilePic'), 
    updateProfile 
);

export default router;