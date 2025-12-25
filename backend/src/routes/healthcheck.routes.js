import {Router} from "express";
import {healthcheck} from "../controllers/healthcheck.controllers.js"
// /api/v1/healthcheck/test

const healthcheckRouter= Router()
healthcheckRouter.route("/").get(healthcheck)
export default healthcheckRouter
