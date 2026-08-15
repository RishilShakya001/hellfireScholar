import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.models.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToken=async (userId)=>{
try {
  
  const user=await User.findById(userId);
  //small check for userr
  const accessToken=user.generateAccessToken()
  const refreshToken=user.generateRefreshToken()
  user.refreshToken=refreshToken
  await user.save({validateBeforeSave:false})
  return {accessToken,refreshToken}
  
} catch (error) {
  throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
}
}


const registerUser = asyncHandler(async (req, res) => {
  const { name, email,  password } = req.body

  // ✅ Validate text fields
  if (
    [name, email, password].some(
      field => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required")
  }

  // ✅ Check existing user
  const existedUser = await User.findOne({
    $or: [{ email }, { name }],
  })

  if (existedUser) {
    throw new ApiError(409, "User with email or name already exists")
  }

  // ✅ Create user
  const user = await User.create({
    name,
    email,
    password,
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user")
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"))
})

const loginUser=asyncHandler(async(req,res)=>{
    //get data from body
    const {email,password}=req.body
    //validation
    if(!email){
        throw new ApiError(409,"Email is required")
    }
    const user =await User.findOne({
       $or: [{email}]
    })
    if(!user){
        throw new ApiError(404,"User not found")
    }
    //validate password
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }
 //for being loggedin
 const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
const loggedInUser=await User.findById(user._id)
.select("-password -refreshToken");
if(!loggedInUser){
  throw new ApiError(500,"something went wrong while loggedin")
}

const options={
  httpOnly:true,
  secure:process.env.NODE_ENV==="production",
}
return res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(new ApiResponse(200,
  {user: loggedInUser,accessToken,refreshToken},
  "User logged in successfully"))

})

const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined,
      }
    },
    {new:true}
  )
const options={
  httpOnly:true,
  secure:process.env.NODE_ENV==="production",

}

return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User logged out successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
   if(!incomingRefreshToken){
    throw new ApiError(401,"Refresh token is required")
   }

   try{
const decodedToken=jwt.verify(
  incomingRefreshToken,
  process.env.REFRESH_TOKEN_SECRET
)
const user=await User.findById(decodedToken?._id)
if(!user){
  throw new ApiError(401,"Invalid refresh token")
}

if(incomingRefreshToken!==user?.refreshToken){
  throw new ApiError(401,"Invalid refresh token")
}

const options={
  httpOnly:true,
  secure:process.env.NODE_ENV==="production",
}

  const {accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshToken(user._id)
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken,options)
  .json(new ApiResponse(200,{accessToken,
    refreshToken:newRefreshToken},"Access token refreshed successfully"));
   }
   catch(error){
throw new ApiError(500,"Something went wrong while refreshing access token")
   }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user =await User.findById(req.user?._id)
    const isPasswordValid=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(401,"Old is password is incorrect")
    }

    user.password=newPassword
  await user.save({validateBeforeSave:false})
  return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))

})

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res.status(200).json(new ApiResponse(200,req.user,"Current user details"))
    
})

const getDashBoard=asyncHandler(async(req,res)=>{
    const userId=req.user._id
    const dashboard=await User.aggregate([
        //match logged in user
        {
            $match:{
                _id:new mongoose.Types.ObjectId(userId)
            }
        },
        //lookup subjects
        {
            $lookup:{
                from:"subjects",
                localField:"_id",
                foreignField:"userId",
                as:"subjects"
            }
        },
        //lookup syllabuses(via subjects)
        {
      $lookup: {
        from: "syllabuses",
        let: { subjectIds: "$subjects._id" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$subjectId", "$$subjectIds"] }
            }
          }
        ],
        as: "syllabuses"
      }
    },
    //lookup attendance
     {
      $lookup: {
        from: "attendances",
        localField: "_id",
        foreignField: "userId",
        as: "attendances"
      }
    },
    //Lookup assignments
   
    {
      $lookup: {
        from: "assignments",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", "$$userId"] },
                  { $eq: ["$status", "pending"] },
                  { $gte: ["$deadline", new Date()] },
                  {
                    $lte: [
                      "$deadline",
                      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    ]
                  }
                ]
              }
            }
          },
          {
            $project: {
              title: 1,
              deadline: 1,
              subjectId: 1
            }
          },
          { $sort: { deadline: 1 } }
        ],
        as: "upcomingAssignments"
      }
    },
     // 7️⃣ Lookup Analytics
    {
      $lookup: {
        from: "analytics",
        localField: "_id",
        foreignField: "userId",
        as: "analytics"
      }
    },
    // 8️⃣ Compute dashboard fields
    {
      $addFields: {
        subjectsCount: { $size: "$subjects" },

        syllabusProgress: {
          $cond: [
            { $gt: [{ $size: "$syllabuses" }, 0] },
            { $avg: "$syllabuses.progressPercent" },
            0
          ]
        },

        attendanceWarnings: {
          $filter: {
            input: "$attendances",
            as: "a",
            cond: { $lt: ["$$a.percentage", "$$a.minRequired"] }
          }
        },

        studyPlanDuration: {
          $arrayElemAt: ["$studyPlan.durationDays", 0]
        },

        analytics: { $arrayElemAt: ["$analytics", 0] }
      }
    },
     // 9️⃣ Shape final response
    {
      $project: {
        name: 1,
        email: 1,

        subjectsCount: 1,
        syllabusProgress: { $round: ["$syllabusProgress", 0] },

        attendanceWarnings: {
          subjectId: 1,
          percentage: 1,
          minRequired: 1
        },

        upcomingAssignments: 1,
        studyPlanDuration: 1,

        studyStreakDays: "$analytics.studyStreakDays",
        studyHours: "$analytics.studyHours",
        weakTopics: "$analytics.weakTopics",
        strongTopics: "$analytics.strongTopics"
      }
    }

    ]);

    if (!dashboard.length) {
    throw new ApiError(404, "Dashboard not found");
  }

  return res.status(200).json(
    new ApiResponse(200, dashboard[0], "Dashboard fetched successfully")
  );

})



export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword
    ,getCurrentUser
    ,getDashBoard
}