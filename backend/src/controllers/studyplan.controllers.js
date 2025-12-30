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
  });

  return res.status(201).json(
    new ApiResponse(201, planDay, "Study plan day added")
  );
});

const updateStudyPlanDay = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { day, task, highlight, completed } = req.body;

  const studyPlan = await StudyPlan.findOne({
    userId: req.user._id,
  });

  if (!studyPlan) {
    throw new ApiError(404, "Study plan not found");
  }

  const update = {};
  if (day) update.day = Number(String(day).replace("Day", "").trim());
  if (typeof task !== "undefined") update.topic = task;
  if (typeof highlight !== "undefined") update.highlight = highlight;
  if (typeof completed !== "undefined") update.completed = completed;

  const planDay = await StudyPlanDay.findOneAndUpdate(
    { _id: id, studyPlanId: studyPlan._id },
    update,
    { new: true }
  );

  if (!planDay) {
    throw new ApiError(404, "Study plan day not found");
  }

  return res.status(200).json(new ApiResponse(200, planDay, "Study plan day updated"));
});

const deleteStudyPlanDay = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const studyPlan = await StudyPlan.findOne({
    userId: req.user._id,
  });

  if (!studyPlan) {
    throw new ApiError(404, "Study plan not found");
  }

  const deleted = await StudyPlanDay.findOneAndDelete({ _id: id, studyPlanId: studyPlan._id });

  if (!deleted) {
    throw new ApiError(404, "Study plan day not found");
  }

  return res.status(200).json(new ApiResponse(200, deleted, "Study plan day deleted"));
});


export {createStudyPlan,
    getStudyPlan,
    generateStudyPlanDays,
    updateStudyPlan,
  addStudyPlanDay,
  updateStudyPlanDay,
  deleteStudyPlanDay
}

const getStudyPlanProgress = asyncHandler(async (req, res) => {
  const studyPlan = await StudyPlan.findOne({ userId: req.user._id });

  if (!studyPlan) {
    throw new ApiError(404, "Study plan not found");
  }

  const days = await StudyPlanDay.find({ studyPlanId: studyPlan._id }).lean();

  const total = days.length;
  const completed = days.filter((d) => d.completed).length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  // breakdown by subject
  const bySubject = {};
  days.forEach((d) => {
    const subj = d.subject || "Custom";
    if (!bySubject[subj]) bySubject[subj] = { subject: subj, total: 0, completed: 0 };
    bySubject[subj].total += 1;
    if (d.completed) bySubject[subj].completed += 1;
  });

  const subjects = Object.values(bySubject).map((s) => ({
    subject: s.subject,
    total: s.total,
    completed: s.completed,
    completion: s.total ? Math.round((s.completed / s.total) * 100) : 0,
  }));

  return res.status(200).json(new ApiResponse(200, { total, completed, percentage, subjects }, "Study plan progress fetched"));
});

export { getStudyPlanProgress };