import Feedback from '../models/Feedback.js'; 
import FeedbackSession from '../models/FeedbackSession.js'; 
import FeedbackTemplate from '../models/FeedbackTemplate.js';

/* ==========================================================================
   LEGACY FEEDBACK CONTROLLERS (Keep these if your old system still uses them)
   ========================================================================== */
const DEFAULTS = {
  general: [
    { id: 'gen_def_1', type: 'scale', text: 'Rate your energy level today (1-10)' },
    { id: 'gen_def_2', type: 'scale', text: 'Rate your sleep quality last night (1-10)' },
    { id: 'gen_def_3', type: 'scale', text: 'How was your appetite/digestion? (1-10)' }
  ],
  therapy: {
    'Vamana': [{ id: 'th_def_v1', type: 'binary', text: 'Did you experience heavy congestion?' }],
    'Virechana': [{ id: 'th_def_vi1', type: 'scale', text: 'How many times did you pass stool?' }],
    'Basti': [{ id: 'th_def_b1', type: 'scale', text: 'Rate lower back stiffness (1-10)' }],
    'Nasya': [{ id: 'th_def_n1', type: 'scale', text: 'Clarity of nasal passage (1-10)' }],
    'Raktamokshana': [{ id: 'th_def_r1', type: 'scale', text: 'Rate pain at the site (1-10)' }]
  }
};

/**
 * Return all feedback entries (Legacy)
 */
export const listFeedbacks = async (req, res) => {
  try {
    const list = await Feedback.find().populate('patientId therapistId', 'name email');
    return res.json(list);
  } catch (err) {
    console.error('❌ Error in listFeedbacks:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new feedback entry (Legacy)
 */
export const createFeedback = async (req, res) => {
  try {
    const body = req.body;
    const fb = await Feedback.create(body);
    return res.status(201).json(fb);
  } catch (err) {
    console.error('❌ Error in createFeedback:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Respond to a feedback ( therapist) (Legacy)
 */
export const respond = async (req, res) => {
  try {
    const id = req.params.id;
    const { therapistInstructions } = req.body;
    const updateFields = {};
    if (therapistInstructions !== undefined) updateFields.therapistInstructions = therapistInstructions;
    updateFields.status = 'reviewed';

    const updated = await Feedback.findByIdAndUpdate(id, updateFields, { new: true }).select('-__v');
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    console.error('❌ Error in respond:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};


/* ==========================================================================
   NEW FEEDBACK SESSION CONTROLLERS (Structured 3-Layer System)
   ========================================================================== */

/**
 * 1. Therapist Sends a Feedback Request
 * Body: { patientId, questions: [{ category, type, text, ... }] }
 */
export const sendFeedbackRequest = async (req, res) => {
  try {
    const { patientId, questions } = req.body;
    const therapistId = req.user.id;

    if (!patientId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const session = await FeedbackSession.create({
      therapistId,
      patientId,
      questions,
      status: 'pending',
      sentAt: new Date()
    });

    return res.status(201).json(session);
  } catch (err) {
    console.error("❌ Error in sendFeedbackRequest:", err.message);
    return res.status(500).json({ message: "Server error occurred while sending request." });
  }
};

/**
 * 2. Patient Gets Pending Requests
 * Used in Patient Dashboard -> Feedback Inbox
 */
export const getPendingRequests = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    // Fetch sessions where status is 'pending' for this patient
    const requests = await FeedbackSession.find({ 
      patientId, 
      status: 'pending' 
    })
    .populate('therapistId', 'name email') // Show who sent it
    .sort({ sentAt: -1 }); // Newest first

    return res.json(requests);
  } catch (err) {
    console.error("❌ Error in getPendingRequests:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * 3. Patient Submits Responses
 * Body: { sessionId, answers: { "q_id": "value" }, patientNotes: "string" }
 */
export const submitFeedbackResponse = async (req, res) => {
  try {
    const { sessionId, answers, patientNotes } = req.body;
    const patientId = req.user.id;

    const session = await FeedbackSession.findOne({ _id: sessionId, patientId });
    if (!session) {
      return res.status(404).json({ message: "Feedback session not found or unauthorized" });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ message: "Feedback already submitted" });
    }

    // Map the incoming answers to the questions array in DB
    // We loop through the stored questions and find the matching answer by ID
    session.questions.forEach(q => {
      // Check if an answer exists for this question ID
      if (answers[q.id] !== undefined) {
        q.answer = answers[q.id];
      }
    });

    session.patientNotes = patientNotes || "";
    session.status = 'completed';
    session.respondedAt = new Date();
    
    await session.save();

    return res.json(session);
  } catch (err) {
    console.error("❌ Error in submitFeedbackResponse:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * 4. Get Feedback History
 * - If Patient calls: Returns their own history
 * - If Therapist calls: Returns history for specific patient (via param) or all their patients
 */
export const getFeedbackHistory = async (req, res) => {
  try {
    const userId = req.user.id; 
    const role = req.user.role; // 'therapist' or 'patient'
    const { patientId } = req.params; // Optional param for filtering

    let query = { status: 'completed' };

    if (role === 'therapist') {
      // Therapist sees feedback they requested
      query.therapistId = userId;
      // Optional: Filter by specific patient if provided
      if (patientId) {
        query.patientId = patientId;
      }
    } else {
      // Patient sees only their own feedback
      query.patientId = userId;
    }

    const history = await FeedbackSession.find(query)
      .populate('patientId', 'name')
      .populate('therapistId', 'name')
      .sort({ respondedAt: -1 }); // Most recent first

    return res.json(history);
  } catch (err) {
    console.error("❌ Error in getFeedbackHistory:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getTemplates = async (req, res) => {
  try {
    const therapistId = req.user.id;
    let template = await FeedbackTemplate.findOne({ therapistId });

    // If no custom template exists, return defaults
    if (!template) {
      return res.json({
        generalQuestions: DEFAULTS.general,
        therapyQuestions: DEFAULTS.therapy
      });
    }
    return res.json(template);
  } catch (err) {
    console.error("❌ Error in getTemplates:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const saveTemplates = async (req, res) => {
  try {
    const therapistId = req.user.id;
    const { generalQuestions, therapyQuestions } = req.body;

    // Upsert (Create if new, Update if exists)
    const template = await FeedbackTemplate.findOneAndUpdate(
      { therapistId },
      { generalQuestions, therapyQuestions },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json(template);
  } catch (err) {
    console.error("❌ Error in saveTemplates:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};