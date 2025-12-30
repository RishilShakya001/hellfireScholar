import api from "../config/api";

export const findOrCreateSubject = (name) =>
  api.post("/subject/find-or-create", { name });

export const getAllSubjects = () =>
  api.get("subject/getsubject");
