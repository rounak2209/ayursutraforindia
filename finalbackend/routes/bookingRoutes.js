
import express from "express";
import { auth, permit } from "../middleware/auth.js";
import { checkAvailability, bookSession, findAvailableTherapists } from "../controllers/bookingController.js";


import { upload } from "../config/cloudinary.js"; 

const router = express.Router();

// router.get("/check", auth, checkAvailability);


router.post("/book", auth, permit(["patient"]), upload.single("prescription"), bookSession);

router.get("/search", auth, findAvailableTherapists); 

export default router;