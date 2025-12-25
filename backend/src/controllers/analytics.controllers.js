import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Analytics} from "../models/analytics.models.js"
 const getUserAnalytics = asyncHandler(async (req, res) => {
  let analytics = await Analytics.findOne({
    userId: req.user._id,
  });

  // Auto-create analytics if not exists
  if (!analytics) {
    analytics = await Analytics.create({
      userId: req.user._id,
      syllabusCompletion: 0,
      studyStreakDays: 0,
      weakTopics: "",
      strongTopics: "",
    });
  }

  return res.status(200).json(
    new ApiResponse(200, analytics, "User analytics fetched successfully")
  );
});


const updateAnalytics = asyncHandler(async (req, res) => {
  const {
    syllabusCompletion,
    studyStreakDays,
    weakTopics,
    strongTopics,
  } = req.body;

  const analytics = await Analytics.findOneAndUpdate(
    { userId: req.user._id },
    {
      $set: {
        ...(syllabusCompletion !== undefined && { syllabusCompletion }),
        ...(studyStreakDays !== undefined && { studyStreakDays }),
        ...(weakTopics !== undefined && { weakTopics }),
        ...(strongTopics !== undefined && { strongTopics }),
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  return res.status(200).json(
    new ApiResponse(200, analytics, "Analytics updated successfully")
  );
});

export{getUserAnalytics,
    updateAnalytics
}