import api from "../config/api";

export const getAttendanceBySubject = (subjectId) =>
  api.get(`/attendance/${subjectId}`);

export const createOrUpdateAttendance = (subjectId, data) =>
  api.put(`/attendance/${subjectId}`, data);
