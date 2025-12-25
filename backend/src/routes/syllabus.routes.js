import {Router} from "express";
import { getSyllabusBySubject, updateSyllabusProgress,deleteSyllabus } from "../controllers/syllabus.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createSyllabus } from "../controllers/syllabus.controllers.js";
const router=Router();

//unsecure routes




//secure routes

router.route("/create").post(verifyJWT,createSyllabus)
router.route("/subject/:subjectId").get(verifyJWT,getSyllabusBySubject)
router.route("/:syllabusId/progress").patch(verifyJWT,updateSyllabusProgress)
router.route("/:syllabusId").delete(verifyJWT,deleteSyllabus)


export default router