import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Syllabus} from "../models/syllabus.models.js"
import {Subject} from "../models/subject.models.js";
import {SyllabusUnit} from "../models/syllabusUnit.models.js";
import mongoose from "mongoose";


//meaans create %of syllabus competition
const createSyllabus=asyncHandler(async (req,res)=>{
const { subjectId } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  // Ensure subject belongs to user
  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // Prevent duplicate syllabus
  const existingSyllabus = await Syllabus.findOne({ subjectId, userId });
  if (existingSyllabus) {
    throw new ApiError(409, "Syllabus already exists for this subject");
  }

  const syllabus = await Syllabus.create({
    subjectId,
    userId,
    progressPercent: 0,
  });

  return res.status(201).json(
    new ApiResponse(201, syllabus, "Syllabus created successfully")
  );
})

const getSyllabusBySubject =asyncHandler(async(req,res)=>{
  const { subjectId } = req.params;
  const userId = req.user._id;

  const syllabus = await Syllabus.findOne({
    subjectId,
    userId,
  }).populate("subjectId", "name");

  if (!syllabus) {
    throw new ApiError(404, "Syllabus not found");
  }

  return res.status(200).json(
    new ApiResponse(200, syllabus, "Syllabus fetched successfully")
  );
})

const updateSyllabusProgress=asyncHandler(async(req,res)=>{
      const { syllabusId } = req.params;
  const userId = req.user._id;

  const syllabus = await Syllabus.findOne({
    _id: syllabusId,
    userId,
  });

  if (!syllabus) {
    throw new ApiError(404, "Syllabus not found");
  }

  // Get units
  const units = await SyllabusUnit.find({
    syllabusId: syllabus._id,
  });

  if (units.length === 0) {
    syllabus.progressPercent = 0;
  } else {
    const completedUnits = units.filter(unit => unit.completed).length;
    syllabus.progressPercent = Math.round(
      (completedUnits / units.length) * 100
    );
  }

  await syllabus.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      syllabus,
      "Syllabus progress updated successfully"
    )
  );
})
const deleteSyllabus=asyncHandler(async(req,res)=>{
    const { syllabusId } = req.params;
  const userId = req.user._id;

  const syllabus = await Syllabus.findOneAndDelete({
    _id: syllabusId,
    userId,
  });

  if (!syllabus) {
    throw new ApiError(404, "Syllabus not found");
  }

  // Cascade delete units
  await SyllabusUnit.deleteMany({
    syllabusId: syllabus._id,
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "Syllabus deleted successfully")
  );
})

export {createSyllabus,getSyllabusBySubject,updateSyllabusProgress,deleteSyllabus}