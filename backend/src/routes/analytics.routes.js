import { Router } from "express";
import { 
  getUserAnalytics, 
  updateAnalytics,
  addTopic,
  deleteTopic
} from "../controllers/analytics.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secure all routes with JWT authentication
router.use(verifyJWT);

// Get user's analytics
router.get("/", getUserAnalytics);

// Update analytics
router.patch("/", updateAnalytics);

// Add a topic
router.post("/topics", addTopic);

// Delete a topic
router.delete("/topics/:category/:topicId", deleteTopic);

export default router;