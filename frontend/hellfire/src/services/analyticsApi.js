import api from "../config/api";

// Get user analytics
export const fetchAnalytics = () => api.get("/analytics");

// Update analytics
export const updateAnalytics = (data) => api.patch("/analytics", data);

// Add topic
export const addTopic = (topicData) => 
  api.post("/analytics/topics", topicData);

// Delete topic
export const deleteTopic = (category, topicId) => 
  api.delete(`/analytics/topics/${category}/${topicId}`);

// Update study hours
export const updateStudyHours = (hours) => 
  api.patch("/analytics", { studyHours: hours });