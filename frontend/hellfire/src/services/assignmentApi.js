import api from "../config/api";

// create
export const createAssignment = (data) =>
  api.post("/assignment/create", data);

// subject wise
export const getAssignmentsBySubject = (subjectId) =>
  api.get(`/assignment/subject/${subjectId}`);

// update status
export const updateAssignmentStatus = (assignmentId, status) =>
  api.patch(`/assignment/${assignmentId}/status`, { status });

// delete
export const deleteAssignment = (assignmentId) =>
  api.delete(`/assignment/${assignmentId}`);
