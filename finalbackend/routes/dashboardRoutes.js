// routes/dashboardRoutes.js
import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { auth, permit } from '../middleware/auth.js'; // use your auth/permit

const router = express.Router();

// Protected route (recommended): allow doctors/admin/therapists (adjust roles)
router.get('/dashboard-stats', auth, permit(['doctor','admin','therapist']), getDashboardStats);

// Optional public test route (remove or comment out in production)
// This helps you test with curl without a token:
// router.get('/dashboard-stats-public', getDashboardStats);

export default router;
