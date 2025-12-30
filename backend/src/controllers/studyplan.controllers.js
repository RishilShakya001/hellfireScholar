import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { StudyPlan } from "../models/studyplan.models.js"
 import {StudyPlanDay} from "../models/studyplanday.models.js"
 import {Subject} from "../models/subject.models.js"
const createStudyPlan = asyncHandler(async (req, res) => {
  const { durationDays } = req.body;

  if (!durationDays || durationDays <= 0) {
    throw new ApiError(400, "Duration days must be greater than 0");
  }

  const studyPlan = await StudyPlan.create({
    userId: req.user._id,
    durationDays,
  });

  return res.status(201).json(
    new ApiResponse(201, studyPlan, "Study plan created successfully")
  );
});

const getStudyPlan = asyncHandler(async (req, res) => {
  const studyPlan = await StudyPlan.findOne({
    userId: req.user._id,
  });

  if (!studyPlan) {
    throw new ApiError(404, "Study plan not found");
  }

 
  const days = await StudyPlanDay.find({
    studyPlanId: studyPlan._id,
  }).sort({ day: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      { studyPlan, days },
      "Study plan fetched successfully"
    )
  );
});

const generateStudyPlanDays = asyncHandler(async (req, res) => {
  const studyPlan = await StudyPlan.findOne({
    userId: req.user._id,
  });

  if (!studyPlan) {
    throw new ApiError(404, "Study plan not found");
  }

  // Clear existing days (regeneration)
  await StudyPlanDay.deleteMany({
    studyPlanId: studyPlan._id,
  });

  const subjects = await Subject.find({
    userId: req.user._id,
  });

  if (!subjects.length) {
    throw new ApiError(400, "No subjects found to generate study plan");
  }

  const days = [];
  let subjectIndex = 0;

  for (let day = 1; day <= studyPlan.durationDays; day++) {
    const subject = subjects[subjectIndex % subjects.length];

    days.push({
      studyPlanId: studyPlan._id,
      day,
      subject: subject.name,
      topic: `Revise ${subject.name}`,
    });

    subjectIndex++;
  }

  await StudyPlanDay.insertMany(days);

  return res.status(201).json(
    new ApiResponse(201, days, "Study plan days generated successfully")
  );
});

const updateStudyPlan = asyncHandler(async (req, res) => {
  const { durationDays } = req.body;

  if (!durationDays || durationDays <= 0) {
    throw new ApiError(400, "Invalid duration");
  }

  const studyPlan = await StudyPlan.findOneAndUpdate(
    { userId: req.user._id },
    { durationDays },
    { new: true }
  );

  if (!studyPlan) {
    throw new ApiError(404, "Study plan not found");
  }

  return res.status(200).json(
    new ApiResponse(200, studyPlan, "Study plan updated successfully")
  );
});

const addStudyPlanDay = asyncHandler(async (req, res) => {
  const { day, task, highlight = false } = req.body;

  if (!day || !task) {
    throw new ApiError(400, "Day and task are required");
  }

  const studyPlan = await StudyPlan.findOne({
    userId: req.user._id,
  });

  if (!studyPlan) {
    throw new ApiError(404, "Study plan not found");
  }

  const planDay = await StudyPlanDay.create({
    studyPlanId: studyPlan._id,
    day: Number(day.replace("Day", "").trim()),
    subject: "Custom",
    topic: task,
    highlight,
  });

  return res.status(201).json(
    new ApiResponse(201, planDay, "Study plan day added")
  );
});


export {createStudyPlan,
    getStudyPlan,
    generateStudyPlanDays,
    updateStudyPlan,
    addStudyPlanDay
}