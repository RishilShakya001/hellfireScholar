import { Router } from "express";
import {
  askQuestion,
  getConversations,
  getConversationById,
  deleteConversation,
} from "../controllers/ai.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secure AI routes protected with JWT verification
router.use(verifyJWT);

router.route("/ask").post(askQuestion);
router.route("/conversations").get(getConversations);
router.route("/conversations/:id").get(getConversationById).delete(deleteConversation);

export default router;
