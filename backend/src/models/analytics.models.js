import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    syllabusCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    strongTopics: [
      {
        name: { type: String, required: true },
        subject: { type: String, required: true },
        confidence: { type: Number, min: 1, max: 10, default: 5 },
        dateAdded: { type: Date, default: Date.now },
      },
    ],
    weakTopics: [
      {
        name: { type: String, required: true },
        subject: { type: String, required: true },
        confidence: { type: Number, min: 1, max: 10, default: 5 },
        dateAdded: { type: Date, default: Date.now },
      },
    ],
    studyHours: { type: Number, default: 0, min: 0 },
    streakData: [{ date: { type: Date, default: Date.now }, hours: Number }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Add methods here if needed
analyticsSchema.methods.updateSyllabusCompletion = async function() {
  // Your logic to calculate completion percentage
  // This is a placeholder - adjust based on your needs
  this.syllabusCompletion = Math.min(100, this.strongTopics.length * 5); // Example calculation
  await this.save();
  return this;
};

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;