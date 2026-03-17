import AssignedTherapy from "../models/AssignedTherapy.js";
import Patient from "../models/Patient.js";
import Therapist from "../models/Therapist.js";



// 1. Generate full 24h slots (We filter these later per therapist)
const generateDailySlots = () => {
  const slots = [];
  let h = 0, m = 0;
  while (h < 24) {
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push(time);
    m += 30;
    if (m === 60) { h++; m = 0; }
  }
  return slots;
};

// 2. Get required blocks for a specific start time
const getRequiredBlocks = (startTime, blocksNeeded) => {
  const allSlots = generateDailySlots();
  const startIndex = allSlots.indexOf(startTime);
  if (startIndex === -1) return []; 
  if (startIndex + blocksNeeded > allSlots.length) return []; 
  return allSlots.slice(startIndex, startIndex + blocksNeeded);
};

// 3. Check if a slot fits within Therapist's Working Hours
const isSlotWithinWorkingHours = (slotTime, startWork, endWork) => {
  if (!startWork || !endWork) return true; 
  return slotTime >= startWork && slotTime < endWork;
};






//  1. SINGLE CHECK (For Booking Modal validation)
export const checkAvailability = async (req, res) => {
  try {
    const { therapistId, startDate, durationDays, therapyType } = req.query;
    
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    // A. Get Duration
    let durationMins = 60;
    if (therapist.therapyDurations && therapist.therapyDurations.get) {
        durationMins = therapist.therapyDurations.get(therapyType) || 60;
    } else if (therapist.therapyDurations && therapist.therapyDurations[therapyType]) {
        durationMins = therapist.therapyDurations[therapyType] || 60;
    }
    const blocksNeeded = Math.ceil(durationMins / 30);

    // B. Calculate Date Range
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(durationDays) - 1);

    // C. Find "Tetris" Collisions (Overlapping Bookings)
    const conflicts = await AssignedTherapy.find({
      therapistId,
      status: { $in: ['scheduled', 'ongoing'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    }).select('bookedSlots');

    const blockedSet = new Set();
    conflicts.forEach(c => {
      if(c.bookedSlots) c.bookedSlots.forEach(slot => blockedSet.add(slot));
    });

    // D. Scan Daily Slots
    const allDailySlots = generateDailySlots();
    const availableStartTimes = [];

    allDailySlots.forEach(slot => {
      // 1. Check Working Hours
      if (!isSlotWithinWorkingHours(slot, therapist.startTime, therapist.endTime)) return;

      // 2. Check "Tetris" Blocks
      const chain = getRequiredBlocks(slot, blocksNeeded);
      
      // Ensure the *entire chain* is within working hours (e.g. don't start at 16:30 if work ends at 17:00 and duration is 60m)
      const fitsInDay = chain.every(s => isSlotWithinWorkingHours(s, therapist.startTime, therapist.endTime));
      
      if (chain.length > 0 && fitsInDay && !chain.some(time => blockedSet.has(time))) {
         availableStartTimes.push(slot);
      }
    });

    res.json({ availableSlots: availableStartTimes, durationMins });

  } catch (err) {
    res.status(500).json({ message: "Server error occurred. Please try again later." });
  }
};


//  2. GLOBAL SEARCH (The Logic You Requested)
export const findAvailableTherapists = async (req, res) => {
  try {
    const { date, time, durationDays, therapyType } = req.query;

    if (!date || !durationDays || !therapyType) {
      return res.status(400).json({ message: "Date, Duration, and Therapy are required." });
    }

    // A. Fetch All Completed Therapists
    const allTherapists = await Therapist.find({ profileStatus: "completed" });
    
    // B. Calculate Date Range
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(durationDays) - 1);
    
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(start);

    // C. "Tetris" Logic: Fetch ALL bookings for this date range
    // This finds bookings that overlap with our requested 7/14/21 days
    const allBookings = await AssignedTherapy.find({
      status: { $in: ['scheduled', 'ongoing'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    }).select('therapistId bookedSlots');

    // Map: { therapistId: Set("09:00", "09:30") }
    const blockedMap = {}; 
    allBookings.forEach(b => {
      if (!blockedMap[b.therapistId]) blockedMap[b.therapistId] = new Set();
      b.bookedSlots.forEach(slot => blockedMap[b.therapistId].add(slot));
    });

    const results = []; 

    // D. Iterate Therapists to find availability
    for (const therapist of allTherapists) {
      // 1. Check Working Days
      if (therapist.workingDays && !therapist.workingDays.includes(dayName)) continue;

      // 2. Get Custom Duration for THIS therapist
      let durationMins = 60;
      if (therapist.therapyDurations && therapist.therapyDurations.get) {
          durationMins = therapist.therapyDurations.get(therapyType) || 60;
      } else if (therapist.therapyDurations && therapist.therapyDurations[therapyType]) {
          durationMins = therapist.therapyDurations[therapyType] || 60;
      }
      
      const blocksNeeded = Math.ceil(durationMins / 30);
      const therapistBlocked = blockedMap[therapist._id] || new Set();

      const validSlots = [];

      // 3. Logic to Find Slots
      const checkSlot = (slot) => {
         // a. Check Working Hours (Strict 09:00 - 17:00 check)
         if (!isSlotWithinWorkingHours(slot, therapist.startTime, therapist.endTime)) return;

         // b. Check if full duration fits before End Time
         const chain = getRequiredBlocks(slot, blocksNeeded);
         const fitsInShift = chain.every(s => isSlotWithinWorkingHours(s, therapist.startTime, therapist.endTime));
         if (!fitsInShift) return;

         // c. Check "Tetris" Block (Collision with existing booking)
         const hasCollision = chain.some(s => therapistBlocked.has(s));
         if (hasCollision) return;

         validSlots.push(slot);
      };

      if (time && time !== "any") {
         // Specific Time Search
         checkSlot(time);
      } else {
         // "Any" Time Search -> Scan all daily slots
         const allSlots = generateDailySlots();
         allSlots.forEach(slot => checkSlot(slot));
      }

      // 4. If valid slots exist, add to results
      if (validSlots.length > 0) {
        results.push({
          id: therapist._id,
          availableSlots: validSlots
        });
      }
    }

    return res.json({ availableTherapists: results });

  } catch (err) {
    console.error("❌ Search Error:", err.message);
    res.status(500).json({ message: "Server error occurred. Please try again later." });
  }
};


//  3. BOOK SESSION (With Safety Checks)
export const bookSession = async (req, res) => {
  try {
    const { therapistId, therapyType, durationDays, date, startTime, fee } = req.body;
    const patientId = req.user.id;

    // 1. Basic Validation
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    // 2. Custom Duration
    let durationMins = 60;
    if (therapist.therapyDurations && therapist.therapyDurations.get) {
        durationMins = therapist.therapyDurations.get(therapyType) || 60;
    } else if (therapist.therapyDurations && therapist.therapyDurations[therapyType]) {
        durationMins = therapist.therapyDurations[therapyType] || 60;
    }

    const blocksNeeded = Math.ceil(durationMins / 30);
    const slotsToBook = getRequiredBlocks(startTime, blocksNeeded);
    
    if (slotsToBook.length === 0) return res.status(400).json({ message: "Invalid time." });

    const start = new Date(date);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(durationDays) - 1);

    // 3. Race Condition Check (Tetris)
    const collision = await AssignedTherapy.findOne({
      therapistId,
      status: { $in: ['scheduled', 'ongoing'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
      bookedSlots: { $in: slotsToBook }
    });

    if (collision) return res.status(400).json({ message: "Slot just taken." });

    // 4. Create Booking
    const newBooking = await AssignedTherapy.create({
      patientId,
      therapistId,
      therapy: therapyType,
      duration: parseInt(durationDays),
      bookedSlots: slotsToBook, 
      startDate: start,
      endDate: end,
      sessionFee: fee,
      status: 'scheduled'
    });

    // 5. Update Patient Profile
    const patient = await Patient.findById(patientId);
    const isTherapyAlreadyListed = patient.prescriptionDetails?.therapies?.some(
      t => t.therapy === therapyType
    );

    const updateQuery = {
      $addToSet: { assignedTherapists: therapistId },
      $set: { "prescriptionDetails.hasPrescription": true }
    };

    if (!isTherapyAlreadyListed) {
      updateQuery.$push = {
        "prescriptionDetails.therapies": {
          therapy: therapyType,
          duration: `${durationDays} Days`
        }
      };
    }

    //  NEW: Prescription PDF/Image Upload Handling
    // Agar frontend se file aayi hai, to uski link db me 'documents' array me save ho jayegi
    if (req.file && req.file.path) {
      const existingDocs = patient.prescriptionDetails?.documents || [];
      updateQuery.$set["prescriptionDetails.documents"] = [...existingDocs, req.file.path];
    }

    await Patient.findByIdAndUpdate(patientId, updateQuery);

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("❌ Booking Error:", err.message);
    res.status(500).json({ message: "Server error occurred. Please try again later." });
  }
};