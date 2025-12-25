import {Router} from "express";
import {loginUser, registerUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser, getDashBoard} from "../controllers/user.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"
const router=Router()
//unsecure routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser)

router.route("/refresh-token").post(refreshAccessToken)



//secure routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/dashboard").get(verifyJWT,getDashBoard)


export default router
