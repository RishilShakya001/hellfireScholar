import mongoose from "mongoose";

const StudyPlanDaySchema = new mongoose.Schema(
  {
    studyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyPlan",
      required: true,
    },

    day: {
      type: Number,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    topic: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const StudyPlanDay= mongoose.model("StudyPlanDay", StudyPlanDaySchema);
