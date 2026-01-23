// controllers/therapistExtraController.js
import Request from "../models/Request.js";
import Patient from "../models/Patient.js";
import Therapist from "../models/Therapist.js";

/**
 * Return accepted requests for therapist :id mapped to a simple shape
 * [
 *   { requestId, status, patient: {...}, therapist: {...}, therapyType }
 * ]
 */
export const getAcceptedPatientsForTherapist = async (req, res) => {
  try {
    const therapistId = req.params.id;
    // only accepted
    const docs = await Request.find({ assignedTherapist: therapistId, status: "accepted" })
      .populate({ path: "patientId", select: "name email personalDetails healthProfile prescriptionDetails assignedTherapists assignedTherapist" })
      .lean();

    const result = (docs || []).map(d => ({
  requestId: d._id,
  status: d.status,
  therapyType: d.therapyType || d.problem || d.requestedTherapy || "—",

  patient: d.patientId || null,
  therapist: d.assignedTherapist || null,

  appointmentDate: d.appointmentDateString || null,
  appointmentTime: d.appointmentTime || null
}));

console.log(
  "ACCEPTED PATIENT API RESPONSE:",
  JSON.stringify(result, null, 2)
);

    return res.json(result);
  } catch (err) {
    console.error("getAcceptedPatientsForTherapist error:", err);
    return res.status(500).json({ message: "Server error", details: err.message });
  }
};
