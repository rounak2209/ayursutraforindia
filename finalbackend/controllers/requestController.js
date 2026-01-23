import Request from "../models/Request.js";
import Patient from "../models/Patient.js";
import Therapist from "../models/Therapist.js";
import mongoose from "mongoose";
import AssignedTherapy from "../models/AssignedTherapy.js";

/**
 * CREATE REQUEST (Patient → Therapist)
 * Frontend must send:
 * - therapistId
 * - appointmentDateString (YYYY-MM-DD)
 * - appointmentTime (HH:mm)
 */
export const createRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      therapistId,
      appointmentDateString,
      appointmentTime,
      sessionFee,
      problem,
      notes,
      therapyType,
      therapyDuration
    } = req.body;

    if (!therapistId || !appointmentDateString || !appointmentTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Convert YYYY-MM-DD → local date (NO UTC SHIFT)
    const [yyyy, mm, dd] = appointmentDateString.split("-").map(Number);
    const appointmentDate = new Date(yyyy, mm - 1, dd);

    const patient = await Patient.findById(userId)
      .select("name email personalDetails")
      .lean();

    const request = await Request.create({
      patientId: userId,
      therapistId,
      appointmentDate,
      appointmentDateString,
      appointmentTime,
      therapyType,
      therapyDuration,
      sessionFee: sessionFee || 0,
      problem: problem || null,
      notes: notes || null,
      status: "pending",
      requestDate: new Date(),
      name: patient?.name,
      email: patient?.email,
      phone: patient?.personalDetails?.contactNumber || null
    });

    return res.status(201).json(request);
  } catch (err) {
    console.error("createRequest ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * LIST REQUESTS (Therapist / Doctor / Admin)
 */
export const listRequests = async (req, res) => {
  try {
    const q = {};

    if (req.user?.role === "therapist") q.therapistId = req.user.id;
    if (req.user?.role === "doctor") q.assignedDoctor = req.user.id;

    const list = await Request.find(q)
      .populate({
        path: "patientId",
        select: `
          name
          email
          personalDetails
          healthProfile
          prescriptionDetails
        `
      })
      .populate("therapistId", "name specializations startTime endTime")
      .lean();

    return res.json(list);
  } catch (err) {
    console.error("listRequests ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ACCEPT REQUEST (Therapist)
 */
export const acceptRequest = async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "accepted" } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    // ===============================
    // ✅ CALCULATE END DATE SAFELY
    // ===============================
    let endDate = null;

    if (updated.therapyDuration && updated.appointmentDateString) {
      // supports: "7 days", "14", "10 days"
      const days = parseInt(updated.therapyDuration);
      if (!isNaN(days)) {
        endDate = new Date(updated.appointmentDateString);
        endDate.setDate(endDate.getDate() + days);
      }
    }

    // ===============================
    // ✅ CREATE ASSIGNED THERAPY
    // ===============================
    if (updated.therapyType && updated.therapyDuration) {
      await AssignedTherapy.create({
        patientId: updated.patientId,
        therapistId: updated.therapistId,
        therapy: updated.therapyType,
        duration: updated.therapyDuration,
        startDate: updated.appointmentDateString,
        endDate: endDate,              // ✅ FIXED
        sessionFee: updated.sessionFee || 0,
        status: "scheduled"
      });
    }

    // attach therapist to patient profile (unchanged)
    await Patient.findByIdAndUpdate(updated.patientId, {
      $addToSet: { assignedTherapists: updated.therapistId }
    });

    const populated = await Request.findById(updated._id)
      .populate(
        "patientId",
        "name email personalDetails healthProfile prescriptionDetails"
      )
      .populate(
        "therapistId",
        "name specializations startTime endTime"
      )
      .lean();

    return res.json(populated);

  } catch (err) {
    console.error("acceptRequest ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};


/**
 * REJECT REQUEST
 */
export const rejectRequest = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const r = await Request.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );

    if (!r) return res.status(404).json({ message: "Not found" });

    return res.json(r);
  } catch (err) {
    console.error("rejectRequest ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATIENTS FOR THERAPIST (Accepted only)
 * Used in Therapist → Patients tab
 */


export const patientsForTherapist = async (req, res) => {
  try {
    const therapistId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
      return res.status(400).json([]);
    }

    const requests = await Request.find({
      therapistId: therapistId,     // ✅ MATCHES DB FIELD
      status: "accepted"            // ✅ MATCHES DB VALUE
    })
      .populate("patientId")
      .sort({ updatedAt: -1 });

    console.log("ACCEPTED PATIENT API RESPONSE:", requests);

    const formatted = requests.map(r => ({
  requestId: r._id,

  // 🟢 THERAPY INFO (FROM REQUEST)
  therapyType: r.therapyType || "—",
  therapyDuration: r.therapyDuration || "—",

  // 🟢 APPOINTMENT INFO
  appointmentDate: r.appointmentDateString || r.appointmentDate,
  appointmentTime: r.appointmentTime,

  // 🟢 PATIENT INFO
  patient: r.patientId
    }));

    res.json(formatted);
  } catch (err) {
    console.error("patientsForTherapist error:", err);
    res.status(500).json([]);
  }
};


/**
 * ACCEPTED REQUESTS FOR PATIENT
 * Used in AssignedTherapists section
 */
export const getAcceptedRequestsForPatient = async (req, res) => {
  try {
    const patientId = req.params.id;

    const requests = await Request.find(
  {
    patientId,
    status: "accepted",
  },
  {
    appointmentDate: 1,
    appointmentDateString: 1,
    appointmentTime: 1,
    therapyType: 1,
    therapyDuration: 1,
    sessionFee: 1,     // ✅ IMPORTANT
    status: 1,
    therapistId: 1,
  }
)
  .populate(
    "therapistId",
    "name phone location experience specializations"
  )
  .lean();

    return res.json(requests);
  } catch (err) {
    console.error("getAcceptedRequestsForPatient ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
