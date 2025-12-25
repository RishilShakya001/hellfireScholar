
import { createAssignment, deleteAssignment, getAssignmentsBySubject, getUpcomingAssignments, updateAssignmentStatus } from "../controllers/assignment.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {Router} from "express"
const router=Router();

//secure routes
router.route("/create").post(verifyJWT,createAssignment)
router.route("/subject/:subjectId").get(verifyJWT,getAssignmentsBySubject)
router.route("/upcoming/all").get(verifyJWT,getUpcomingAssignments)
router.route("/:assignmentId/status").patch(verifyJWT,updateAssignmentStatus)
router.route("/:assignmentId").delete(verifyJWT,deleteAssignment)




export default router