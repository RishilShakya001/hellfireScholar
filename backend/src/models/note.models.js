import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const NoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },

    title: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,//cloudinary url
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

NoteSchema.plugin(mongooseAggregatePaginate)

export const Note= mongoose.model("Note", NoteSchema);



//uploadNote
// getNotesBySubject
// deleteNote
// searchNotesByTag
