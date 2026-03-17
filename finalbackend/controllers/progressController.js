import Progress from "../models/Progress.js";
import AssignedTherapy from "../models/AssignedTherapy.js";
import ProgressResponse from "../models/ProgressResponse.js";
import mongoose from "mongoose";

/**
 * POST /api/progress/submit
 * (Legacy/Alternative submit for Progress model - keep if needed, otherwise ignore)
 */
export const submitProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { assignedTherapyId, answers, maxScore } = req.body;
    if (!assignedTherapyId || !Array.isArray(answers) || typeof maxScore !== "number") {
      return res.status(400).json({ message: "Missing fields" });
    }

    const at = await AssignedTherapy.findById(assignedTherapyId).lean();
    if (!at) return res.status(404).json({ message: "Assigned therapy not found" });

    if (String(at.patientId) !== String(userId)) {
      return res.status(403).json({ message: "Not allowed to submit for this therapy" });
    }

    const totalScore = answers.reduce((s, a) => s + Number(a.value || 0), 0);
    const dateString = new Date().toISOString().split("T")[0];

    const doc = await Progress.findOneAndUpdate(
      { assignedTherapyId, patientId: userId, dateString },
      { $set: { answers, totalScore, maxScore } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json(doc);
  } catch (err) {
    console.error("❌ Error in submitProgress:", err.message);
    return res.status(500).json({ message: "Server error occurred while submitting progress." });
  }
};

/**
 * GET /api/progress/therapy/:assignedTherapyIdOrType
 * FIXED: Now fetches from ProgressResponse (Daily Questions) even if called with ID.
 */
export const getTherapyProgress = async (req, res) => {
  try {
    const param = req.params.assignedTherapyId;
    if (!param) return res.status(400).json({ message: "Missing therapy identifier" });

    const authPatientId = req.user?.id || null;
    let patientId = authPatientId || req.query.patientId;
    let therapyType = param;
    let assignedInfo = { id: null, therapy: param };

    // 1. If param is an ID, resolve it to Therapy Type & Patient
    if (mongoose.Types.ObjectId.isValid(param)) {
      const at = await AssignedTherapy.findById(param).lean();
      if (!at) return res.status(404).json({ message: "Assigned therapy not found" });
      
      therapyType = at.therapy; // e.g., "Vamana"
      patientId = at.patientId.toString();
      
      assignedInfo = {
        id: at._id,
        therapy: at.therapy,
        duration: at.duration,
        startDate: at.startDate,
        endDate: at.endDate,
        status: at.status,
        sessionsCompleted: at.sessionsCompleted || 0 
      };
    }

    if (!patientId) {
      return res.status(400).json({ message: "Missing patient context" });
    }

    // 2. Query the CORRECT collection (ProgressResponse)
    // We filter by { percentage: { $gt: 0 } } to ignore unanswered questions
    const responses = await ProgressResponse.find({
      patientId,
      therapyType: therapyType,
      percentage: { $gt: 0 } 
    })
    .sort({ dateString: 1 }) // Sort by date ascending for the line chart
    .lean();

    // 3. Map to the 'daily' format expected by frontend
    const dailyMapped = responses.map(r => ({
      dateString: r.dateString,
      percentage: r.percentage ?? 0,
      totalScore: r.questions?.reduce((s, q) => s + (Number(q.answer) || 0), 0) || 0,
      maxScore: r.questions?.reduce((s, q) => s + (Number(q.maxScore) || 0), 0) || 0
    }));

    // 4. Calculate overall average for this therapy
    const therapyProgressPct = dailyMapped.length === 0
        ? 0
        : Math.round(dailyMapped.reduce((s, d) => s + (d.percentage || 0), 0) / dailyMapped.length);

    return res.json({
      assignedTherapy: assignedInfo,
      daily: dailyMapped,
      therapyProgressPct
    });

  } catch (err) {
    console.error("❌ Error in getTherapyProgress:", err.message);
    return res.status(500).json({ message: "Server error occurred while fetching therapy progress." });
  }
};


/**
 * GET /api/progress/patient/:patientId
 * Aggregates overall patient recovery
 */
export const getPatientProgress = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user?.id;
    if (!patientId) return res.status(400).json({ message: "Missing patientId" });

    // Fetch all answered responses
    const answeredResponses = await ProgressResponse.find({
      patientId,
      percentage: { $gt: 0 } 
    }).lean();

    const assignedTherapies = await AssignedTherapy.find({ patientId }).lean();

    const therapies = assignedTherapies.map(at => {
      // Filter and Sort responses by Date (Oldest -> Newest)
      const therapyResponses = answeredResponses
        .filter(r => r.therapyType === at.therapy)
        .sort((a, b) => new Date(a.dateString) - new Date(b.dateString));
      
      let improvement = null;

      //  LOGIC: Calculate from First Day - Last Day
      // We need at least 2 points to calculate a trend/improvement range.
      if (therapyResponses.length >= 2) {
        const first = therapyResponses[0].percentage || 0;
        const last = therapyResponses[therapyResponses.length - 1].percentage || 0;
        improvement = last - first; // Calculate the gain (e.g. 80% - 20% = 60% recovery)
      }
      
      return {
        therapy: at.therapy,
        therapyProgressPct: improvement, // Will be null if < 2 sessions
        dailyCount: therapyResponses.length,
        totalSessions: parseInt(at.duration) || 0,
        assignedTherapyId: at._id 
      };
    });

    // ✅ OVERALL: Average of valid improvements, else DASH
    const validTherapies = therapies.filter(t => t.therapyProgressPct !== null);
    
    let overallRecovery = "-"; // Default to dash if not enough data

    if (validTherapies.length > 0) {
      const totalImp = validTherapies.reduce((acc, t) => acc + t.therapyProgressPct, 0);
      overallRecovery = Math.round(totalImp / validTherapies.length);
    }

    return res.json({ therapies, overallRecovery });
  } catch (err) {
    console.error("❌ Error in getPatientProgress:", err.message);
    return res.status(500).json({ message: "Server error occurred while fetching patient progress." });
  }
};