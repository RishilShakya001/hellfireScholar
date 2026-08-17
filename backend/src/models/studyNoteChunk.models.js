import mongoose from "mongoose";

const StudyNoteChunkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    documentTitle: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

// Index to optimize querying vectors by userId and subjectId
StudyNoteChunkSchema.index({ userId: 1, subjectId: 1, noteId: 1 });

export const StudyNoteChunk = mongoose.model("StudyNoteChunk", StudyNoteChunkSchema);
