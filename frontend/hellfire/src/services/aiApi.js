import api from "../config/api";

export const askQuestion = (payload) =>
  api.post("/ai/ask", payload);

export const getConversations = (subjectId) =>
  api.get("/ai/conversations", { params: { subjectId } });

export const getConversationById = (conversationId) =>
  api.get(`/ai/conversations/${conversationId}`);

export const deleteConversation = (conversationId) =>
  api.delete(`/ai/conversations/${conversationId}`);
