import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Subject} from "../models/subject.models.js"
const createSubject=asyncHandler(async(req,res)=>{
  const {name}=req.body;
  if(!name?.trim()){
      throw new ApiError(400,"Subject name is required");
  }
 
 
const subject = await Subject.create({

    userId: req.user._id,
    name,
  });

  return res.status(201).json(
    new ApiResponse(201, subject, "Subject created successfully")
  );

})

const getAllSubject=asyncHandler(async(req,res)=>{
const subjects=await Subject.find({
    userId:req.user._id,
}).sort({createdAt:-1});
return res.status(200).json(
    new ApiResponse(200,subjects,"subjects fetched succesfully")
);
});

const updateSubject=asyncHandler(async(req,res)=>{
const { subjectId } = req.params;
  const { name } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Subject name is required");
  }

  const subject = await Subject.findOneAndUpdate(
    { 
        _id: subjectId, userId: req.user._id 
    },

       { 
          $set:{
            name} 
          },
    { new: true }
  );

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  return res.status(200).json(
    new ApiResponse(200, subject, "Subject updated successfully")
  );

})

const deleteSubject=asyncHandler(async(req,res)=>{
  const { subjectId } = req.params;

  const subject = await Subject.findOneAndDelete({
    _id: subjectId,
    userId: req.user._id,
  });

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Subject deleted successfully")
  );
})
//subject scoped data
//for getting subject syllabus


import {Syllabus} from "../models/syllabus.models.js";
import {SyllabusUnit} from "../models/syllabusUnit.models.js";
const getSubjectUnits=asyncHandler(async(req,res)=>{
    const { subjectId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  // 1️⃣ Ensure subject belongs to user
  const subject = await Subject.findOne({
    _id: subjectId,
    userId,
  });

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // 2️⃣ Get syllabus for subject
  const syllabus = await Syllabus.findOne({
    subjectId,
    userId,
  });

  if (!syllabus) {
    throw new ApiError(404, "Syllabus not found");
  }

  // 3️⃣ Get syllabus units
  const units = await SyllabusUnit.find({
    syllabusId: syllabus._id,
  }).sort({ createdAt: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subject: subject.name,
        syllabusId: syllabus._id,
        totalUnits: units.length,
        completedUnits: units.filter(u => u.completed).length,
        units,
      },
      "Syllabus units fetched successfully"
    )
  );
})


//for getting subject assignments
import {Assignment} from "../models/assignment.models.js"
const getSubjectAssignments=asyncHandler(async(req,res)=>{
const { subjectId } = req.params;

  const assignments = await Assignment.find({
    subjectId,
    userId: req.user._id
  }).sort({ deadline: 1 });

  if (assignments.length === 0) {
  return res.status(200).json(
    new ApiResponse(200, [], "No assignments found")
  );
}
  
  
    return res.status(200).json(
      new ApiResponse(200, assignments, "Assignments fetched")
    );
  
})

import {Attendance} from "../models/attendance.models.js"
const getSubjectAttendance=asyncHandler(async(req,res)=>{
 const {subjectId}=req.params;
 const attendance=await Attendance.findOne({
    subjectId,
    userId:req.user._id
 });

 return res.status(200).json(
    new ApiResponse(200,attendance,"Attendance fetched")
 );
})

//for notes
import {Note} from "../models/note.models.js"
const getSubjectNotes=asyncHandler(async(req,res)=>{
 const {subjectId}=req.params;
 const notes=await Note.find({
    subjectId,
    userId: req.user._id
 }).sort({uploadedAt:-1});

 return res.status(200).json(
    new ApiResponse(200,notes,"Notes fetched")
 );
})

export {createSubject,
    getAllSubject,
    updateSubject,
    deleteSubject,
    getSubjectAssignments,
    getSubjectNotes,
    getSubjectAttendance,
    getSubjectUnits
}