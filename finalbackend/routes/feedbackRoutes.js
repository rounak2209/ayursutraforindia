import express from 'express';
import { 
  // Legacy Controllers
  listFeedbacks, 
  createFeedback, 
  respond,

  // New Feedback Session Controllers
  sendFeedbackRequest, 
  getPendingRequests, 
  submitFeedbackResponse, 
  getFeedbackHistory,

  // New Global Template Controllers
  getTemplates, 
  saveTemplates
} from '../controllers/feedbackController.js';

import { auth, permit } from '../middleware/auth.js';

const router = express.Router();

/* ==========================================================================
   LEGACY ROUTES (Keep for backward compatibility if needed)
   ========================================================================== */
router.get('/', auth, permit(['doctor','therapist']), listFeedbacks);
router.post('/', createFeedback);
router.put('/:id/respond', auth, permit(['doctor','therapist']), respond);


/* ==========================================================================
   NEW SYSTEM: GLOBAL TEMPLATES (Therapist Only)
   ========================================================================== */
// Get the therapist's saved global settings
router.get('/templates', auth, permit(['therapist']), getTemplates);

// Save/Update global settings
router.post('/templates', auth, permit(['therapist']), saveTemplates);


/* ==========================================================================
   NEW SYSTEM: FEEDBACK SESSIONS (Interactive Flow)
   ========================================================================== */

// 1. Therapist sends a new question set to a patient
router.post('/request', auth, permit(['therapist']), sendFeedbackRequest);

// 2. Patient checks their inbox for pending requests
router.get('/pending', auth, permit(['patient']), getPendingRequests);

// 3. Patient submits their answers
router.post('/submit', auth, permit(['patient']), submitFeedbackResponse);

// 4. View History
// - Patient sees their own history
// - Therapist sees history (can filter by adding /:patientId)
router.get('/history/:patientId?', auth, getFeedbackHistory);

export default router;