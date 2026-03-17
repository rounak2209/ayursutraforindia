import Request from "../models/Request.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";
import AssignedTherapy from "../models/AssignedTherapy.js";


const getIndiaDateString = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
};

/**
 * CREATE REQUEST (Patient → Therapist)
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
    console.error("❌ Error in createRequest:", err.message);
    return res.status(500).json({ message: "Server error occurred while creating request." });
  }
};

/**
 * LIST REQUESTS (Therapist)
 */
export const listRequests = async (req, res) => {
  try {
    const q = {};
    if (req.user?.role === "therapist") q.therapistId = req.user.id;

    const list = await Request.find(q)
      .populate("patientId", "name email personalDetails healthProfile prescriptionDetails")
      .populate("therapistId", "name specializations startTime endTime")
      .lean();

    return res.json(list);
  } catch (err) {
    console.error("❌ Error in listRequests:", err.message);
    return res.status(500).json({ message: "Server error occurred while listing requests." });
  }
};

/**
 * ACCEPT REQUEST (Legacy)
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

    let endDate = null;
    if (updated.therapyDuration && updated.appointmentDateString) {
      const days = parseInt(updated.therapyDuration);
      if (!isNaN(days)) {
        endDate = new Date(updated.appointmentDateString);
        endDate.setDate(endDate.getDate() + days);
      }
    }

    // Create Assigned Therapy
    await AssignedTherapy.create({
      patientId: updated.patientId,
      therapistId: updated.therapistId,
      therapy: updated.therapyType,
      duration: parseInt(updated.therapyDuration) || 1, 
      startDate: updated.appointmentDateString,
      endDate: endDate || updated.appointmentDateString,
      bookedSlots: [updated.appointmentTime], 
      sessionFee: updated.sessionFee || 0,
      status: "scheduled"
    });

    await Patient.findByIdAndUpdate(updated.patientId, {
      $addToSet: { assignedTherapists: updated.therapistId }
    });

    return res.json(updated);
  } catch (err) {
    console.error("❌ Error in acceptRequest:", err.message);
    return res.status(500).json({ message: "Server error occurred while accepting request." });
  }
};

/**
 * REJECT REQUEST
 */
export const rejectRequest = async (req, res) => {
  try {
    const r = await Request.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: "Not found" });
    return res.json(r);
  } catch (err) {
    console.error("❌ Error in rejectRequest:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ UPDATED: PATIENTS FOR THERAPIST
 * Now includes DATE COMPARISON LOGIC for correct session status
 */
export const patientsForTherapist = async (req, res) => {
  try {
    const therapistId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
      return res.status(400).json([]);
    }

    // India Date String (Today)
    const todayStr = getIndiaDateString();

    const docs = await AssignedTherapy.find({
      therapistId: therapistId,
      status: { $in: ["scheduled", "ongoing", "in-progress", "completed"] }
    })
      .populate("patientId")
      .sort({ startDate: -1 });

    const formatted = docs.map(d => {
      
      //  LOGIC ADDED: Compare Dates
      let displayStatus = 'pending';
      let dbDateStr = "";

      if (d.lastSessionDate) {
          if (d.lastSessionDate instanceof Date) {
              dbDateStr = d.lastSessionDate.toISOString().split('T')[0];
          } else {
              dbDateStr = String(d.lastSessionDate).substring(0, 10);
          }
      }

      // Check if DB Date matches Today
      if (dbDateStr === todayStr) {
          displayStatus = d.todaysSessionStatus;
      }

      return {
        requestId: d._id,
        _id: d._id,

        //  THERAPY INFO
        therapyType: d.therapy || "—",
        therapyDuration: d.duration || "—",

        //  APPOINTMENT INFO
        appointmentDate: d.startDate ? new Date(d.startDate).toISOString().split("T")[0] : null,
        appointmentTime: (d.bookedSlots && d.bookedSlots.length > 0) ? d.bookedSlots[0] : "—",

        //  SESSION STATUS (Corrected)
        todaysSessionStatus: displayStatus,
        lastSessionDate: d.lastSessionDate,

        //  PATIENT INFO
        patient: d.patientId
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error in patientsForTherapist:", err.message);
    res.status(500).json([]);
  }
};

/**
 * ACCEPTED REQUESTS FOR PATIENT (Legacy)
 */
export const getAcceptedRequestsForPatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const requests = await Request.find({ patientId, status: "accepted" }).lean();
    return res.json(requests);
  } catch (err) {
    console.error("❌ Error in getAcceptedRequestsForPatient:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};