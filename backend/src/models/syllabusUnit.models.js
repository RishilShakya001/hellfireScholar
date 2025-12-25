import mongoose from "mongoose";

const SyllabusUnitSchema = new mongoose.Schema(
  {
    syllabusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Syllabus",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const SyllabusUnit= mongoose.model("SyllabusUnit", SyllabusUnitSchema);
