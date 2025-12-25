import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(
    cors(
        {
            origin:process.env.CORS_ORIGIN,
            credentials:true
        }
    )
)

//common middleware
app.use(express.json({limit :"16kb"}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))
 app.use(express.static("public"))

 app.use(cookieParser())
 //import routes
import healthcheckRouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import subjectRouter from "./routes/subject.routes.js"
import syllabusRouter from "./routes/syllabus.routes.js"
import syllabusUnitRouter from "./routes/syllabusUnit.routes.js"
import attendanceRouter from "./routes/attendance.routes.js"

import assignmentRouter from "./routes/assignment.routes.js"
import studyPlanRouter from "./routes/studyplan.routes.js"
import analyticsRouter from "./routes/analytics.routes.js"

import noteRouter from "./routes/note.routes.js"

 //write routes
app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/users",userRouter)

app.use("/api/v1/subject",subjectRouter)
app.use("/api/v1/syllabus",syllabusRouter)
app.use("/api/v1/syllabus-unit",syllabusUnitRouter)

app.use("/api/v1/attendance",attendanceRouter)


app.use("/api/v1/assignment",assignmentRouter)
app.use("/api/v1/studyplan",studyPlanRouter)

app.use("api/v1/analytics",analyticsRouter)

app.use("api/v1/note",noteRouter)
export {app}