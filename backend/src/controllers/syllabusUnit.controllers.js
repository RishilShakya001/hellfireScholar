
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Syllabus} from "../models/syllabus.models.js"
import { SyllabusUnit } from "../models/syllabusUnit.models.js";

const addSyllabusUnit=asyncHandler(async(req,res)=>{
    const {syllabusId}=req.params;
    const {title}=req.body;
    const userId=req.user._id;
    if(!title?.trim()){
        throw new ApiError(400,"UNit title is required");
    }
    const syllabus=await Syllabus.findOne({
        _id:syllabusId,
        userId,
    });

    if(!syllabus){
        throw new ApiError(404,"Syllabus not found");
    }

    const unit =await SyllabusUnit.create({
        syllabusId,
        title:title.trim(),
        completed:false,
    });

    return res.status(201).json(
        new ApiResponse(201,unit,"Syllabus unit added successfully")
    );

});


const toggleUnitCompletion=asyncHandler(async(req,res)=>{
    const {unitId}=req.params;

    const unit = await SyllabusUnit.findById(unitId);

  if (!unit) {
    throw new ApiError(404, "Syllabus unit not found");
  }

  unit.completed = !unit.completed;
  await unit.save();

  return res.status(200).json(
    new ApiResponse(200, unit, "Unit completion toggled successfully")
  );
})
const updateUnit =asyncHandler(async(req,res)=>{
    const {unitId}=req.params;
    const {title}=req.body;
    if (!title?.trim()) {
    throw new ApiError(400, "Unit title is required");
  }

  const unit = await SyllabusUnit.findByIdAndUpdate(
    unitId,
    { title: title.trim() },
    { new: true }
  );

  if (!unit) {
    throw new ApiError(404, "Syllabus unit not found");
  }

  return res.status(200).json(
    new ApiResponse(200, unit, "Unit updated successfully")
  );
})

const deleteUnit=asyncHandler(async(req,res)=>{
    const{unitId}=req.params;
    const unit=await SyllabusUnit.findByIdAndDelete(unitId);
    if(!unit){
        throw new ApiError(404,"Syllabus unit not found");

    }

    return res.status(200).json
(
    new ApiResponse(200,{},"unit deleted succefully")
);
});

export {
    addSyllabusUnit,
    toggleUnitCompletion,
    updateUnit,
    deleteUnit
}