import AssignedTherapy from "../models/AssignedTherapy.js";

console.log("🔥 assigned therapy controller loaded");

/**
 * GET all assigned therapies for a specific patient ID (Admin/Doctor use)
 * GET /api/patients/:id/prescriptions
 */
export const getPatientPrescriptions = async (req, res) => {
  console.log("🔥 API HIT: getPatientPrescriptions");
  console.log("➡️ Patient ID:", req.params.id);
  try {
    const { id } = req.params;

    const therapies = await AssignedTherapy.find({ patientId: id })
      .populate("therapistId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const normalized = therapies.map((t) => ({
      _id: t._id,
      therapyName: t.therapy,
      status: t.status || "ongoing",
      startDate: t.startDate,
      endDate: t.endDate || null,
      sessionsCompleted: t.sessionsCompleted || 0,
      totalSessions: t.totalSessions || "—",
      duration: t.duration || "—",
      description: t.notes || "",
      sessionFee: t.sessionFee || 0,
      benefits: [],
      precautions: [],
      therapistName: t.therapistId?.name || "Assigned Therapist",
      nextSession: null,
      createdAt: t.createdAt,
    }));

    return res.json(normalized);
  } catch (err) {
    console.error("getPatientPrescriptions ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ ADD THIS NEW FUNCTION HERE AT THE BOTTOM 👇

/**
 * GET therapies for the currently logged-in patient
 * GET /api/assigned-therapies/my
 */
export const getMyTherapies = async (req, res) => {
  try {
    const patientId = req.user.id; // Comes from auth middleware

    // Fetch active therapies (scheduled or in-progress)
    const therapies = await AssignedTherapy.find({ 
      patientId: patientId,
      status: { $in: ['scheduled', 'in-progress'] }
    })
    .populate('therapistId', 'name email personalInfo professional sessionDuration') // Get Therapist details
    .sort({ startDate: 1 });

    return res.json(therapies);
  } catch (err) {
    console.error('getMyTherapies error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};