import {verifyJWT} from "../middlewares/auth.middlewares.js"
import {Router} from "express"
import {upload} from "../middlewares/multer.middlewares.js"
import { deleteNote, getNotesBySubject, searchNotesByTag, uploadNote, createTextNote } from "../controllers/note.controllers.js";

const router=Router();

//secure route 
router.route("/upload").post(verifyJWT,upload.single("File"),uploadNote)
router.route("/create-text").post(verifyJWT,createTextNote)
router.route("/subject/:subjectId").get(verifyJWT,getNotesBySubject)
router.route("/search").get(verifyJWT,searchNotesByTag)
router.route("/:noteId").delete(verifyJWT,deleteNote)

export default router