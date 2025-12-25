import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
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

    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["assignment", "quiz", "lab"],
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "done", "missing"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Assignment= mongoose.model("Assignment", AssignmentSchema);
