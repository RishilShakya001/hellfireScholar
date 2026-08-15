import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import {Note} from "../models/note.models.js"

const uploadNote = asyncHandler(async (req, res) => {
  const { subjectId, title, tags } = req.body

  // ✅ Validate text fields
  if ([subjectId, title].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "Subject and title are required")
  }

  // ✅ Multer file
  const noteLocalPath = req.file?.path

  if (!noteLocalPath) {
    throw new ApiError(400, "Note file is missing")
  }

  // ✅ Upload note file
  const noteFile = await uploadOnCloudinary(noteLocalPath)

  if (!noteFile || !noteFile.url) {
    throw new ApiError(500, "Note upload failed")
  }

  try {
    // ✅ Create note
    const note = await Note.create({
      userId: req.user._id,
      subjectId,
      title,
      fileUrl: noteFile.url,
      tags: tags || "",
      uploadedAt: new Date(),
    })

    return res
      .status(201)
      .json(new ApiResponse(201, note, "Note uploaded successfully"))
  } catch (error) {
    console.log("Note creation failed")

    // 🧹 Cleanup uploaded file
    if (noteFile?.public_id) {
      await deleteFromCloudinary(noteFile.public_id)
    }

    throw new ApiError(
      500,
      "Something went wrong while uploading note and file was deleted"
    )
  }
})

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params

  if (!noteId) {
    throw new ApiError(400, "Note ID is required")
  }

  // ✅ Find note
  const note = await Note.findOne({
    _id: noteId,
    userId: req.user._id,
  })

  if (!note) {
    throw new ApiError(404, "Note not found")
  }

  try {
    // 🧹 Delete file from cloudinary
    if (note.fileUrl) {
      const publicId = note.fileUrl
        .split("/")
        .pop()
        .split(".")[0]

      await deleteFromCloudinary(publicId)
    }

    // 🗑 Delete DB record
    await note.deleteOne()

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Note deleted successfully"))
  } catch (error) {
    console.log("Note deletion failed")

    throw new ApiError(
      500,
      "Something went wrong while deleting note"
    )
  }
})

const getNotesBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params

  if (!subjectId) {
    throw new ApiError(400, "Subject ID is required")
  }

  const notes = await Note.find({
    userId: req.user._id,
    subjectId,
  }).sort({ uploadedAt: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"))
})

const searchNotesByTag = asyncHandler(async (req, res) => {
  const { tag } = req.query

  if (!tag || tag.trim() === "") {
    throw new ApiError(400, "Tag is required")
  }

  const notes = await Note.find({
    userId: req.user._id,
    tags: { $regex: tag, $options: "i" },
  }).sort({ uploadedAt: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes matched successfully"))
})




const createTextNote = asyncHandler(async (req, res) => {
  const { subjectId, title, content, tags } = req.body

  if ([subjectId, title, content].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "Subject, title, and content are required")
  }

  try {
    const note = await Note.create({
      userId: req.user._id,
      subjectId,
      title,
      content,
      tags: tags || "",
      uploadedAt: new Date(),
    })

    return res
      .status(201)
      .json(new ApiResponse(201, note, "Text note created successfully"))
  } catch (error) {
    console.error("Text note creation failed:", error)
    throw new ApiError(500, "Something went wrong while creating text note")
  }
})

export {deleteNote,uploadNote,searchNotesByTag,getNotesBySubject,createTextNote}