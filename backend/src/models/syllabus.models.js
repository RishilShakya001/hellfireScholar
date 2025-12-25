import mongoose from "mongoose";

const SyllabusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    progressPercent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Syllabus= mongoose.model("Syllabus", SyllabusSchema);
