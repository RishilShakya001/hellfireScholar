import api from "../config/api";

export const createSyllabus = (subjectId) =>
  api.post("/syllabus/create", { subjectId });

export const getSyllabusBySubject = (subjectId) =>
  api.get(`/syllabus/subject/${subjectId}`);

export const addUnit = (syllabusId, title) =>
  api.post(`/syllabus-unit/${syllabusId}/units`, { title });
export const getUnitBySubject=(subjectId)=>api.get(`/subject/${subjectId}/units`)

export const toggleUnit = (unitId) =>
  api.patch(`/syllabus-unit/units/${unitId}/toggle`);

export const updateProgress = (syllabusId) =>
  api.patch(`/syllabus/${syllabusId}/progress`);
// Add this to your existing syllabusApi.js
export const deleteUnit = (unitId) => api.delete(`/syllabus-unit/units/${unitId}`);
