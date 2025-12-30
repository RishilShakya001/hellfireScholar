import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

import {Attendance} from "../models/attendance.models.js"
import {Subject} from "../models/subject.models.js"
import mongoose from "mongoose"
const createOrUpdateAttendance=asyncHandler(async(req,res)=>{
  const { subjectId } = req.params;
  const { attended, total, minRequired = 75 } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  if (attended < 0 || total <= 0 || attended > total) {
    throw new ApiError(400, "Invalid attendance values");
  }

  // Ensure subject belongs to user
  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  const percentage = Math.round((attended / total) * 100);

  const attendance = await Attendance.findOneAndUpdate(
    { subjectId, userId },
    {
      attended,
      total,
      percentage,
      minRequired
    },
    { upsert: true, new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, attendance, "Attendance saved successfully")
  );
})

const getAttendanceBySubject=asyncHandler(async(req,res)=>{
    const { subjectId } = req.params;
  const userId = req.user._id;

  const attendance = await Attendance.findOne({
    subjectId,
    userId
  }).populate("subjectId", "name");

if (!attendance) {
  attendance = await Attendance.create({
    userId,
    subjectId,
    attended: 0,
    total: 0,
    percentage: 0,
  });
}


  return res.status(200).json(
    new ApiResponse(200, attendance, "Attendance fetched successfully")
  );
})

const getAttendanceWarnings=asyncHandler(async(req,res)=>{
   const userId = req.user._id;

  const warnings = await Attendance.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $match: {
        $expr: { $lt: ["$percentage", "$minRequired"] }
      }
    },
    {
      $lookup: {
        from: "subjects",
        localField: "subjectId",
        foreignField: "_id",
        as: "subject"
      }
    },
    { $unwind: "$subject" },
    {
      $project: {
        subject: "$subject.name",
        percentage: 1,
        minRequired: 1
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, warnings, "Attendance warnings fetched")
  );
})

export {createOrUpdateAttendance,
    getAttendanceBySubject,
    getAttendanceWarnings
}