
import Patient from '../models/Patient.js';
import Request from '../models/Request.js'; 

export const getDashboardStats = async (req, res) => {
  try {
    // total patients
    const totalPatients = await Patient.countDocuments();

    // pending requests (if you have a Request collection)
    let pendingRequests = 0;
    try {
      pendingRequests = await Request.countDocuments({ status: 'pending' });
    } catch (e) {
      // If Request model not present, leave pendingRequests = 0
      pendingRequests = 0;
    }

    // Optionally, if you have appointments collection, compute today's appointments.
    // For now keep 0 (safe).
    const todayAppointments = 0;

    return res.json({
      totalPatients,
      todayAppointments,
      pendingRequests
    });
  } catch (err) {
    console.error('❌ Dashboard Stats Error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
