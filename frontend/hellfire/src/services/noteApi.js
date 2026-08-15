import api from "../config/api";

export const uploadNote = (formData) =>
  api.post("/note/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getNotesBySubject = (subjectId) =>
  api.get(`/note/subject/${subjectId}`);

export const deleteNote = (noteId) =>
  api.delete(`/note/${noteId}`);

export const createTextNote = (noteData) =>
  api.post("/note/create-text", noteData);
