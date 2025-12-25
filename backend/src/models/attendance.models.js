import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
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

    attended: Number,
    total: Number,

    percentage: {
      type: Number,
      default: 0,
    },

    minRequired: {
      type: Number,
      default: 75,
    },
  },
  { timestamps: true }
);

export const Attendance= mongoose.model("Attendance", AttendanceSchema);
