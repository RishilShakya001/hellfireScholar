import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    syllabusCompletion: {
      type: Number,
      default: 0,
    },

    studyStreakDays: {
      type: Number,
      default: 0,
    },

    weakTopics: {
      type: [String],
      default: [],
    },

    strongTopics: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const Analytics= mongoose.model("Analytics", AnalyticsSchema);
