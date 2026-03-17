import Patient from '../models/Patient.js';


export const list = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("assignedTherapist", "name email")
      .populate("assignedTherapists", "name email specializations phone startTime endTime");
    res.json(patients);
  } catch (err) {
    console.error("❌ Error in list Patients:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ONE PATIENT
export const getOne = async (req, res) => {
  try {
    const p = await Patient.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Patient not found" });
    const patient = p.toObject();
    delete patient.password;
    return res.json(patient);
  } catch (err) {
    console.error("❌ Error in getOne Patient:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// CREATE PATIENT
export const create = async (req, res) => {
  try {
    const body = req.body;
    const p = await Patient.create(body);
    res.status(201).json({ id: p._id });
  } catch (err) {
    console.error("❌ Error in create Patient:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};



export const update = async (req, res) => {
  try {
    // 1. Request Body ki copy banao
    let updateData = { ...req.body };

    

    
    
    
    
    // Personal Details Parse
    if (updateData.personalDetails && typeof updateData.personalDetails === 'string') {
      try {
        updateData.personalDetails = JSON.parse(updateData.personalDetails);
      } catch (e) {
        console.error("❌ Personal Details Parse Error:", e.message);
      }
    }

    // Health Profile Parse
    if (updateData.healthProfile && typeof updateData.healthProfile === 'string') {
      try {
        updateData.healthProfile = JSON.parse(updateData.healthProfile);
      } catch (e) {
        console.error("❌ Health Profile Parse Error:", e.message);
      }
    }

    // Prescription Details Parse
    if (updateData.prescriptionDetails && typeof updateData.prescriptionDetails === 'string') {
      try {
        updateData.prescriptionDetails = JSON.parse(updateData.prescriptionDetails);
      } catch (e) {
        console.error("❌ Prescription Details Parse Error:", e.message);
      }
    }

    
    // 📂 FILE UPLOAD HANDLING
    
    if (req.files) {
      // Profile Pic
      if (req.files["profilePic"]) {
        updateData.profilePic = req.files["profilePic"][0].path;
      }

      // Prescriptions
      if (req.files["prescriptions"]) {
        const newDocs = req.files["prescriptions"].map((file) => file.path);
        
        // Ensure prescriptionDetails object hai
        if (!updateData.prescriptionDetails) updateData.prescriptionDetails = {};
        
        // Documents array mein add karo
        
        
        
        updateData.prescriptionDetails.documents = newDocs;
      }
    }

    

    
    // 💾 DB UPDATE
    
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // $set use karna zaroori hai
      { new: true }
    )
      .populate("assignedTherapist", "name email")
      .populate("assignedTherapists", "name email");

    if (!updated) return res.status(404).json({ message: "Patient not found" });

    const patient = updated.toObject();
    delete patient.password;

    res.json(patient);

  } catch (err) {
    console.error("❌ Update Error:", err.message);
    res.status(500).json({ message: "Server error occurred during update" });
  }
};

export const remove = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("❌ Error in remove Patient:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};