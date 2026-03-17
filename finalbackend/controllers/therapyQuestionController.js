
import TherapyQuestion from "../models/TherapyQuestion.js";
import Therapist from "../models/Therapist.js";

/**
 * POST /api/therapy-questions
 * Body: { therapyType, questions }
 * Saves or updates therapist's questions for that therapyType (upsert).
 * Requires auth middleware (req.user.id = therapistId)
 */
export const saveTherapyQuestions = async (req, res) => {
  try {
    const therapistId = req.user?.id;
    if (!therapistId) return res.status(401).json({ message: "Unauthorized" });

    const { therapyType, questions } = req.body;
    if (!therapyType || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Missing therapyType or questions" });
    }

    // sanitize questions: keep only text + optional maxScore (number)
    const clean = questions.map(q => ({
      text: String(q.text || "").trim(),
    })).filter(q => q.text.length > 0);

    const doc = await TherapyQuestion.findOneAndUpdate(
      { therapistId, therapyType },
      { $set: { questions: clean } },
      { upsert: true, new: true }
    );

    return res.json(doc);
  } catch (err) {
    console.error("❌ Error in saveTherapyQuestions:", err.message);
    return res.status(500).json({ message: "Server error occurred while saving questions." });
  }
};

/**
 * GET /api/therapy-questions/my
 * Returns:
 * {
 * specializations: [ "Basti", ... ],
 * questionsByTherapy: { "Basti": [ {text, maxScore} ], ... }
 * }
 * Uses req.user.id to identify therapist.
 */
export const getMyTherapyQuestions = async (req, res) => {
  try {
    const therapistId = req.user?.id;
    if (!therapistId) return res.status(401).json({ message: "Unauthorized" });

    // fetch therapist to read specializations
    const therapist = await Therapist.findById(therapistId).lean();
    const rawSpecs = Array.isArray(therapist?.specializations) ? therapist.specializations : [];

    // Map stored specializations to canonical therapyType names (case-insensitive)
    
    const normalize = (s) => {
      if (!s) return null;
      const lower = String(s).toLowerCase();
      if (lower.includes("vamana")) return "Vamana";
      if (lower.includes("vire")) return "Virechana";
      if (lower.includes("basti")) return "Basti";
      if (lower.includes("nasya")) return "Nasya";
      if (lower.includes("rakt")) return "Raktamokshana";
      // fallback: Title case first letter
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const specializations = [...new Set(rawSpecs.map(normalize).filter(Boolean))];

    // fetch all saved docs for this therapist
    const docs = await TherapyQuestion.find({ therapistId }).lean();

    const questionsByTherapy = {};
    //  READ default maxScore from schema (single source of truth)
    const defaultMaxScore =
      TherapyQuestion.schema
        .path("questions")
        .schema
        .path("maxScore")
        .defaultValue;

    docs.forEach(d => {
      const key = d.therapyType;

      questionsByTherapy[key] = (d.questions || []).map(q => ({
        text: q.text,
        maxScore: q.maxScore ?? defaultMaxScore
      }));
    });

    
    specializations.forEach(s => {
      if (!questionsByTherapy[s]) questionsByTherapy[s] = [];
    });

    return res.json({ specializations, questionsByTherapy });
  } catch (err) {
    console.error("❌ Error in getMyTherapyQuestions:", err.message);
    return res.status(500).json({ message: "Server error occurred while fetching your questions." });
  }
};

/**
 * (optional) keep existing GET /api/therapy-questions/:therapyType for generic reads
 */
export const getTherapyQuestions = async (req, res) => {
  try {
    const { therapyType } = req.params;
    const doc = await TherapyQuestion.findOne({ therapyType }).lean();
    return res.json(doc || { questions: [] });
  } catch (err) {
    console.error("❌ Error in getTherapyQuestions:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};