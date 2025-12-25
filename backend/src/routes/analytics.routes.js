import { getUserAnalytics, updateAnalytics } from "../controllers/analytics.controllers.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {Router} from "express"

const router=Router();

//secure routes

router.route("/").get(verifyJWT,getUserAnalytics)
router.route("/").patch(verifyJWT,updateAnalytics)




export default router