import mongoose from "mongoose";

const therapyQuestionSchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Therapist",
    required: true
  },
  therapyType: {
    type: String,
    enum: ["Vamana", "Virechana", "Basti", "Nasya", "Raktamokshana"],
    required: true
  },
  questions: [
    {
      text: { type: String, required: true },
      maxScore: { type: Number, default: 10 }
    }
  ]
}, { timestamps: true });

therapyQuestionSchema.index({ therapistId: 1, therapyType: 1 }, { unique: true });

export default mongoose.model("TherapyQuestion", therapyQuestionSchema);
