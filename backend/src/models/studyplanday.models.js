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
      highlight: {
        type: Boolean,
        default: false,
      },
      completed: {
        type: Boolean,
        default: false,
      },
  },
  { timestamps: true }
);

export const StudyPlanDay= mongoose.model("StudyPlanDay", StudyPlanDaySchema);
