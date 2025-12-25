import mongoose from "mongoose";

const StudyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    durationDays: {
      type: Number,
      default: 14,
    },
  },
  { timestamps: true }
);

export const StudyPlan= mongoose.model("StudyPlan", StudyPlanSchema);
