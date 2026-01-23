// finalbackend/controllers/progressResponseController.js
import ProgressResponse from "../models/ProgressResponse.js";
import AssignedTherapy from "../models/AssignedTherapy.js"; 
import TherapyQuestion from "../models/TherapyQuestion.js";
import mongoose from "mongoose";

// Therapist sends questions to a patient (Create NEW entry every time)
export const sendQuestions = async (req, res) => {
  try {
    const therapistId = req.user?.id;
    if (!therapistId) return res.status(401).json({ message: "Unauthorized" });

    const { patientId, therapyType } = req.body;
    if (!patientId || !therapyType) {
      return res.status(400).json({ message: "Missing patientId or therapyType" });
    }

    // Prepare today's date string (YYYY-MM-DD)
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];

    // 🔴 REMOVED: await ProgressResponse.deleteMany(...) 
    // We now KEEP old data so it doesn't disappear from the UI.

    // Fetch therapist's saved questions for this therapy
    const tqDoc = await TherapyQuestion.findOne({ therapistId, therapyType }).lean();
    if (!tqDoc || !Array.isArray(tqDoc.questions) || tqDoc.questions.length === 0) {
      return res.status(404).json({ message: "No saved questions for this therapy" });
    }

    // Default maxScore from schema
    const defaultMaxScore =
      TherapyQuestion.schema.path("questions").schema.path("maxScore").defaultValue;

    // Build questions array
    const questions = tqDoc.questions.map(q => ({
      text: q.text,
      maxScore: q.maxScore ?? defaultMaxScore
    }));

    // Create a NEW ProgressResponse document (Appends to history)
    const responseDoc = await ProgressResponse.create({
      patientId,
      therapistId,
      therapyType,
      date: new Date(dateString),
      dateString,
      questions,
      percentage: 0 // starts at 0%
    });

    return res.status(201).json(responseDoc);
  } catch (err) {
    console.error("sendQuestions error:", err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
};

// Patient fetches today's questions (Returns ALL sets sent today)
export const getTodaysQuestions = async (req, res) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(401).json({ message: "Unauthorized" });

    const todayString = new Date().toISOString().split("T")[0];
    
    // Returns array of all question sets sent today
    const docs = await ProgressResponse.find({ patientId, dateString: todayString }).lean();

    return res.json(docs);
  } catch (err) {
    console.error("getTodaysQuestions error:", err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
};

// Patient submits answers
export const submitAnswers = async (req, res) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(401).json({ message: "Unauthorized" });

    const responseId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(responseId)) {
      return res.status(400).json({ message: "Invalid response id" });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers must be an array" });
    }

    const doc = await ProgressResponse.findById(responseId);
    if (!doc) return res.status(404).json({ message: "Response not found" });
    if (doc.patientId.toString() !== patientId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Ensure answers match question length
    if (answers.length !== doc.questions.length) {
      return res.status(400).json({ message: "Incorrect number of answers" });
    }

    // Check if this doc was already answered to prevent double-counting sessions
    const wasAlreadyAnswered = doc.percentage > 0;

    // Validate answers and set them
    let sum = 0;
    let sumMax = 0;
    for (let i = 0; i < doc.questions.length; i++) {
      const ans = answers[i];
      const max = doc.questions[i].maxScore;
      if (typeof ans !== "number" || ans < 0 || ans > max) {
        return res.status(400).json({ message: "Invalid answer value" });
      }
      doc.questions[i].answer = ans;
      sum += ans;
      sumMax += max;
    }

    const calculatedPct = sumMax > 0 ? Math.round((sum / sumMax) * 100) : 0;
    doc.percentage = calculatedPct;
    await doc.save();

    // Update AssignedTherapy (Sessions Count & Average)
    try {
      const assigned = await AssignedTherapy.findOne({
        patientId: doc.patientId,
        therapy: doc.therapyType
      });

      if (assigned) {
        // Only increment session count if this specific doc wasn't answered before
        if (!wasAlreadyAnswered) {
          assigned.sessionsCompleted = (assigned.sessionsCompleted || 0) + 1;
          await assigned.save();
        }
        
        // Recalculate average based on ALL answered responses (historical + new)
        const answeredForTherapy = await ProgressResponse.find({
          patientId: doc.patientId,
          therapyType: doc.therapyType,
          percentage: { $gt: 0 }
        }).lean();

        const avg = answeredForTherapy.length === 0
            ? 0
            : Math.round(
                answeredForTherapy.reduce((a, r) => a + (r.percentage || 0), 0) /
                  answeredForTherapy.length
              );

        assigned.therapyProgressPct = avg; 
        await assigned.save();
      }
    } catch (e) {
      console.warn("Failed to update AssignedTherapy counters:", e);
    }

    return res.json(doc);
  } catch (err) {
    console.error("submitAnswers error:", err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
};