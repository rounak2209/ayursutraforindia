// finalbackend/controllers/patientController.js
import Patient from '../models/Patient.js';

//
// LIST ALL PATIENTS
//
export const list = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("assignedDoctor", "name email")
      .populate("assignedTherapist", "name email")
      .populate("assignedTherapists", "name email specializations phone startTime endTime");

    res.json(patients);
  } catch (err) {
    console.error("patient.list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//
// GET ONE PATIENT (Profile)
//
export const getOne = async (req, res) => {
  try {
    const p = await Patient.findById(req.params.id)
      .populate("assignedDoctor", "name email")
      .populate("assignedTherapist", "name email specializations phone startTime endTime")
      .populate("assignedTherapists", "name email specializations phone startTime endTime");

    if (!p) return res.status(404).json({ message: "Patient not found" });

    const patient = p.toObject();

    // Remove sensitive fields
    delete patient.password;

    return res.json(patient);
  } catch (err) {
    console.error("patient.getOne error:", err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
};

//
// CREATE PATIENT
//
export const create = async (req, res) => {
  try {
    const body = req.body;
    const p = await Patient.create(body);
    res.status(201).json({ id: p._id });
  } catch (err) {
    console.error("patient.create error:", err);
    res.status(500).json({ message: err.message });
  }
};

//
// UPDATE PATIENT
//
export const update = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("assignedTherapist", "name specializations startTime endTime")
      .populate("assignedTherapists", "name specializations startTime endTime");

    // remove password if present
    const patient = updated.toObject();
    delete patient.password;

    res.json(patient);
  } catch (err) {
    console.error("patient.update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//
// DELETE PATIENT
//
export const remove = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("patient.remove error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
