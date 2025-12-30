import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Assignment} from "../models/assignment.models.js"

const createAssignment=asyncHandler(async(req,res)=>{
const {subjectId,title,type,deadline}=req.body
if(!subjectId||!title||!deadline){
    throw new ApiError(400,"subject,title and deadline are required");

}
const assignment=await Assignment.create({
      userId: req.user._id,
    subjectId,
    title,
    type,
    deadline,
    status: "pending",
});
return res.status(201).json(
    new ApiResponse(201,assignment,"Assignment created successfully")
);
});

const getAssignmentsBySubject=asyncHandler(async(req,res)=>{
     const { subjectId } = req.params;

  const assignments = await Assignment.find({
    userId: req.user._id,
    subjectId,
  }).populate("subjectId","name")
  .sort({ deadline: 1 });

  return res.status(200).json(
    new ApiResponse(200, assignments, "Assignments fetched successfully")
  );
})

const getUpcomingAssignments=asyncHandler(async(req,res)=>{
     const today = new Date();

  const assignments = await Assignment.find({
    userId: req.user._id,
    deadline: { $gte: today },
    status: { $ne: "completed" },
  })
    .sort({ deadline: 1 })
    .limit(5);

  return res.status(200).json(
    new ApiResponse(200, assignments, "Upcoming assignments fetched")
  );
})

const updateAssignmentStatus=asyncHandler(async(req,res)=>{
     const { assignmentId } = req.params;
  const { status } = req.body;

  if (!["pending", "done", "missing"].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const assignment = await Assignment.findOneAndUpdate(
    { _id: assignmentId, userId: req.user._id },
    { status },
    { new: true }
  );

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, assignment, "Assignment status updated")
  );
})

const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findOneAndDelete({
    _id: assignmentId,
    userId: req.user._id,
  });

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Assignment deleted successfully")
  );
});
export {
    createAssignment,
    getAssignmentsBySubject,
    getUpcomingAssignments,
    updateAssignmentStatus,
    deleteAssignment
}