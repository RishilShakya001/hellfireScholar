import {Router} from "express";
import { createSubject,getAllSubject,updateSubject,deleteSubject,getSubjectAssignments,getSubjectAttendance,getSubjectNotes,getSubjectUnits ,findOrCreateSubject} from "../controllers/subject.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router();
//unsecure routes
router.route("/:subjectId/units").get(verifyJWT,getSubjectUnits)
router.route("/:subjectId/assignments").get(getSubjectAssignments)
router.route("/:subjectId/attendance").get(getSubjectAttendance)
router.route("/:subjectId/notes").get(getSubjectNotes)



//secure routes
router.route("/create-subject").post(verifyJWT,createSubject)
router.route("/getsubject").get(verifyJWT,getAllSubject)
router.route("/find-or-create").post(verifyJWT,findOrCreateSubject)

router.route("/:subjectId").patch(verifyJWT,updateSubject)

router.route("/:subjectId").delete(verifyJWT,deleteSubject)

export default router