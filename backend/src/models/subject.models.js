import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index:true,
    },

    name: {
      type: String,
      required: true,
        trim: true,
  lowercase: true,
    },
   
  },
  { timestamps: true }
);

export const Subject= mongoose.model("Subject", SubjectSchema);
