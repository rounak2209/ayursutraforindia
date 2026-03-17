
import AssignedTherapy from "../models/AssignedTherapy.js";

/**
 * Return active patients for therapist :id
 * NOW: Fetches from AssignedTherapy (Direct Booking) instead of Requests
 */
export const getAcceptedPatientsForTherapist = async (req, res) => {
  try {
    const therapistId = req.params.id;
    
    // Find all active/scheduled therapies for this therapist
    const docs = await AssignedTherapy.find({ 
      therapistId: therapistId, 
      status: { $in: ["scheduled", "ongoing", "in-progress", "completed"] } 
    })
    .populate({ 
      path: "patientId", 
      select: "name email personalDetails healthProfile prescriptionDetails assignedTherapists assignedTherapist" 
    })
    .sort({ startDate: -1 })
    .lean();

    const result = (docs || []).map(d => ({
      requestId: d._id, // Frontend uses this as key
      status: d.status,
      therapyType: d.therapy || "—", // Schema field is 'therapy'

      patient: d.patientId || null,
      therapist: d.therapistId || null,

      //  FIX: Map Date to String format for frontend
      appointmentDate: d.startDate ? new Date(d.startDate).toISOString().split("T")[0] : null,
      
      //  FIX: Extract first time slot from array
      appointmentTime: (d.bookedSlots && d.bookedSlots.length > 0) ? d.bookedSlots[0] : "—"
    }));

    return res.json(result);
  } catch (err) {
    console.error("❌ Error in getAcceptedPatientsForTherapist:", err.message);
    return res.status(500).json({ message: "Server error occurred while fetching accepted patients." });
  }
};