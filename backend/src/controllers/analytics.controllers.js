import Analytics from "../models/analytics.models.js";
import { Syllabus } from "../models/syllabus.models.js";
import { SyllabusUnit } from "../models/syllabusUnit.models.js";
import { Subject } from "../models/subject.models.js";

// Get user's analytics
export const getUserAnalytics = async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ user: req.user._id })
      .populate('user', 'name email')
      .lean();

    if (!analytics) {
      // Create new analytics document if it doesn't exist
      analytics = await Analytics.create({ 
        user: req.user._id,
        syllabusCompletion: 0,
        strongTopics: [],
        weakTopics: [],
        studyHours: 0,
        streakData: [],
      });
    }

    // Fetch syllabi for user and include subject name + unit progress
    const syllabi = await Syllabus.find({ userId: req.user._id })
      .populate("subjectId", "name")
      .lean();

    const syllabusDetails = await Promise.all(
      syllabi.map(async (s) => {
        const units = await SyllabusUnit.find({ syllabusId: s._id }).lean();
        const totalUnits = units.length;
        const completedUnits = units.filter((u) => u.completed).length;
        const progress = totalUnits ? Math.round((completedUnits / totalUnits) * 100) : s.progressPercent || 0;

        return {
          syllabusId: s._id,
          subjectId: s.subjectId?._id,
          subjectName: s.subjectId?.name || null,
          progressPercent: progress,
          totalUnits,
          completedUnits,
          units: units.map(u => ({ id: u._id, title: u.title, completed: u.completed }))
        };
      })
    );

    // Also fetch subjects list (useful for analytics UI)
    const subjects = await Subject.find({ userId: req.user._id }).lean();

    const payload = {
      ...analytics,
      syllabi: syllabusDetails,
      subjects: subjects.map((sub) => ({ id: sub._id, name: sub.name })),
    };

    res.status(200).json(payload);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

// Update analytics
export const updateAnalytics = async (req, res) => {
  try {
    const { strongTopics, weakTopics, studyHours, streakData } = req.body;
    const updateData = { lastUpdated: new Date() };

    if (strongTopics) updateData.strongTopics = strongTopics;
    if (weakTopics) updateData.weakTopics = weakTopics;
    if (studyHours !== undefined) updateData.studyHours = studyHours;
    if (streakData) updateData.streakData = streakData;

    const analytics = await Analytics.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Update completion percentage
    await analytics.updateSyllabusCompletion();

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error updating analytics:", error);
    res.status(500).json({ message: "Failed to update analytics" });
  }
};

// Add a topic
export const addTopic = async (req, res) => {
  try {
    const { category, name, subject, confidence } = req.body;
    const field = category === 'strong' ? 'strongTopics' : 'weakTopics';
    
    const topic = {
      name,
      subject,
      confidence: confidence || 5,
      dateAdded: new Date()
    };

    const analytics = await Analytics.findOneAndUpdate(
      { user: req.user._id },
      { 
        $push: { [field]: topic },
        $set: { lastUpdated: new Date() }
      },
      { new: true, upsert: true }
    );

    // Update completion percentage
    await analytics.updateSyllabusCompletion();

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error adding topic:", error);
    res.status(500).json({ message: "Failed to add topic" });
  }
};

// Delete a topic
export const deleteTopic = async (req, res) => {
  try {
    const { topicId, category } = req.params;
    const field = category === 'strong' ? 'strongTopics' : 'weakTopics';

    const analytics = await Analytics.findOneAndUpdate(
      { user: req.user._id },
      { 
        $pull: { [field]: { _id: topicId } },
        $set: { lastUpdated: new Date() }
      },
      { new: true }
    );

    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found" });
    }

    // Update completion percentage
    await analytics.updateSyllabusCompletion();

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({ message: "Failed to delete topic" });
  }
};


