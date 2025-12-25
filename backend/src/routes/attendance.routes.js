import {Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js"

import {createOrUpdateAttendance,
    getAttendanceBySubject,
    getAttendanceWarnings} from "../controllers/attendance.conrollers.js"

    const  router=Router();
    //secure routes
router.route("/:subjectId").put(verifyJWT,createOrUpdateAttendance);
router.route("/:subjectId").get(verifyJWT,getAttendanceBySubject)
router.route("/warning/all").get(verifyJWT,getAttendanceWarnings)




export default router;


