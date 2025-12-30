import { addStudyPlanDay, createStudyPlan, generateStudyPlanDays, getStudyPlan, updateStudyPlan, updateStudyPlanDay, deleteStudyPlanDay, getStudyPlanProgress } from "../controllers/studyplan.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {Router} from "express"

const router=Router()

//secure 
router.route("/create").post(verifyJWT,createStudyPlan)

router.route("/getstudyp").get(verifyJWT,getStudyPlan)
router.route("/generate").post(verifyJWT,generateStudyPlanDays)
router.route("/update").patch(verifyJWT,updateStudyPlan)
router.route("/day").post(verifyJWT, addStudyPlanDay);
router.route("/day/:id").patch(verifyJWT, updateStudyPlanDay).delete(verifyJWT, deleteStudyPlanDay);
router.route("/progress").get(verifyJWT, getStudyPlanProgress);


export default router