
import Therapist from "../models/Therapist.js";
import bcrypt from "bcryptjs";
 
//  Utility: generate time slots dynamically
function generateTimeSlots(startTime, endTime, duration = 60) {
  if (!startTime || !endTime) return [];

  const toMinutes = (t) => {
    const [h, m = "0"] = t.split(":");
    return Number(h) * 60 + Number(m);
  };

  const toTime = (mins) => {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  let start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (Number.isNaN(start) || Number.isNaN(end)) return [];

  const slots = [];
  while (start + duration <= end) {
    slots.push(toTime(start));
    start += duration;
  }

  return slots;
}

const SALT_ROUNDS = 10;

export const list = async (req, res) => {
  try {
    // allow optional query filtering (specialization, location, minExperience)
    const { specialization, location, minExperience } = req.query;
    const q = {};
    if (specialization) q.specializations = { $in: [specialization] };
    if (location) q.location = { $regex: location, $options: "i" };
    if (minExperience) q.experience = { $gte: Number(minExperience) };

    const docs = await Therapist.find(q).select("-password -__v").lean();

    const result = docs.map(t => ({
      ...t,
      timeSlots: generateTimeSlots(
        t.startTime,
        t.endTime,
        t.sessionDuration || 60
      )
    }));

    return res.json(result);

  } catch (err) {
    console.error("❌ Error in list Therapists:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const t = await Therapist.findById(id).select("-password -__v");
    if (!t) return res.status(404).json({ message: "Not found" });
    return res.json(t);
  } catch (err) {
    console.error("❌ Error in getOne Therapist:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const create = async (req, res) => {
  try {
    const data = { ...req.body };

    // if password provided, hash it before saving
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    // avoid accidental clients setting role
    delete data.role;


    const t = await Therapist.create(data);
    return res.status(201).json({ id: t._id });
  } catch (err) {
    console.error("❌ Error in create Therapist:", err.message);
    // duplicate key error handling (email)
    if (err.code === 11000) return res.status(409).json({ message: "Duplicate key" });
    return res.status(500).json({ message: "Server error" });
  }
};

export const update = async (req, res) => {
  try {
    // require auth middleware to set req.user
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const targetId = req.params.id;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

   

    // block dangerous updates from generic update
    const forbidden = ["_id", "id", "email", "password", "role", ];
    const updates = {};
    Object.keys(req.body || {}).forEach((k) => {
      if (!forbidden.includes(k)) updates[k] = req.body[k];
    });

    const updated = await Therapist.findByIdAndUpdate(targetId, { $set: updates }, { new: true }).select("-password -__v");
    if (!updated) return res.status(404).json({ message: "Therapist not found" });
    return res.json(updated);
  } catch (err) {
    console.error("❌ Error in update Therapist:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const targetId = req.params.id;
    const requesterId = req.user.id;
    
    

    const updates = {};
    const allowed = [
      "name",
      "specializations",
      "therapyDurations",
      "workingDays",
      "startTime",
      "endTime",
      "phone",
      "money",
      "bio",
      "profileStatus",
      "location",
      "experience",
      "unavailableDates",
    ];

    //  Handle File Upload (Profile Pic)
    if (req.file) {
        updates.profilePic = req.file.path; // Cloudinary URL
    }

    // Handle Text Fields (From FormData or JSON)
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) {
          // If coming from FormData, complex fields might be JSON strings
          if (["specializations", "workingDays", "therapyDurations", "unavailableDates"].includes(k) && typeof req.body[k] === 'string') {
              try {
                  updates[k] = JSON.parse(req.body[k]);
              } catch (e) {
                  updates[k] = req.body[k]; // Fallback
              }
          } else {
              updates[k] = req.body[k];
          }
      }
    });

    const updated = await Therapist.findByIdAndUpdate(
      targetId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json(updated);
  } catch (err) {
    console.error("❌ Error in updateProfile Therapist:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};