import AssignedTherapy from "../models/AssignedTherapy.js";




// Ye ensure karega ki Fetch karte waqt bhi wahi date bane jo Save karte waqt bani thi.
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

export const getTherapistSchedule = async (req, res) => {
  try {
    const therapistId = req.user.id;
    
    // 1. Calculate Today (India)
    const todayStr = getIndiaDateString(); 

    

    const sessions = await AssignedTherapy.find({
      therapistId: therapistId,
      status: { $in: ['scheduled', 'ongoing'] }
    })
    .populate('patientId', 'name email personalDetails')
    .sort({ startDate: 1 });

    const formatted = sessions.map(s => {
      
      let displayStatus = 'pending'; 
      
      
      
      const dbDate = s.lastSessionDate ? String(s.lastSessionDate) : null;

      
      
      
      

      //  3. EXACT MATCH CHECK
      if (dbDate === todayStr) {
         displayStatus = s.todaysSessionStatus; // Match hua -> Completed dikhao
      } else {
         displayStatus = 'pending'; // Match nahi hua -> Start Session dikhao
      }

      return {
        _id: s._id,
        patientId: s.patientId,
        patientName: s.patientId?.name || "Unknown",
        therapyType: s.therapy,
        totalDays: s.duration,
        startDate: s.startDate,
        endDate: s.endDate,
        appointmentTime: (s.bookedSlots && s.bookedSlots.length > 0) ? s.bookedSlots[0] : "—", 
        status: s.status,
        completedDates: s.completedDates || [],
        sessionsCompleted: s.sessionsCompleted,
        
        displayDate: new Date(), 
        todaysSessionStatus: displayStatus 
      };
    });

    return res.json(formatted);
  } catch (err) {
    
    return res.status(500).json({ message: 'Server error' });
  }
};



export const getPatientPrescriptions = async (req, res) => {
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
      totalSessions: t.duration || "—",
      duration: t.duration || "—",
      description: t.notes || "",
      sessionFee: t.sessionFee || 0,
      therapistName: t.therapistId?.name || "Assigned Therapist",
      timeSlot: (t.bookedSlots && t.bookedSlots.length > 0) ? t.bookedSlots[0] : "—",
      createdAt: t.createdAt,
      completedDates: t.completedDates || [] 
    }));

    return res.json(normalized);
  } catch (err) {
    
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyTherapies = async (req, res) => {
  try {
    const patientId = req.user.id;
    const therapies = await AssignedTherapy.find({ 
      patientId: patientId,
      status: { $in: ['scheduled', 'in-progress', 'ongoing'] }
    })
    .populate('therapistId', 'name email phone location experience specializations money')
    .sort({ startDate: 1 });

    const result = therapies.map(t => {
      const doc = t.toObject();
      return {
        ...doc,
        timeSlot: (doc.bookedSlots && doc.bookedSlots.length > 0) ? doc.bookedSlots[0] : "—",
        completedDates: doc.completedDates || []
      };
    });

    return res.json(result);
  } catch (err) {
    
    return res.status(500).json({ message: 'Server error' });
  }
};