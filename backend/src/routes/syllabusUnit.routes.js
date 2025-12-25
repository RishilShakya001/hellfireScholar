import { addSyllabusUnit, deleteUnit, toggleUnitCompletion, updateUnit } from "../controllers/syllabusUnit.controllers.js"
import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router=Router();

//unsecure router



//secure router

router.route("/:syllabusId/units").post(verifyJWT,addSyllabusUnit)
router.route("/units/:unitId/toggle").patch(verifyJWT,toggleUnitCompletion)

router.route("/units/:unitId").patch(verifyJWT,updateUnit)

router.route("/units/:unitId").delete(verifyJWT,deleteUnit)



export default router
