import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { recruitersService } from "./recruiters.service";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import { RecruiterModel } from "./recruiters.model";

const createRecruiters = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const payload = req.body
    // Generate UserId (Auto-increment 5-digit number with 'R-' prefix)
const lastRecruiter = await RecruiterModel.findOne().sort({ RecID: -1 });
let newRecruiterId = 'R-00001'; // Default to the first user ID

if (lastRecruiter) {
  const lastUserId = parseInt(lastRecruiter.RecID.replace('R-', ''), 10); // Remove the 'R-' prefix and convert to number
  newRecruiterId = `R-${(lastUserId + 1).toString().padStart(5, '0')}`; // Add 'R-' and pad the number to 5 digits
}

payload.RecID = newRecruiterId;

if (req.file) {
         payload.imageUrl =  `/uploads/recruiters/${req.file.filename}`
    }

    const result = await recruitersService.createRecruitersFromDB(payload);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Recruiter Not Created Successfully!")
    }
    sendResponse(res, {
        code : StatusCodes.ACCEPTED,
        message : "Recruiter Created Successfully.",
        data : result
    })
})

const readAllRecruiter = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const result = await recruitersService.getAllRecruiters();
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Didn't get Data Successfully!")
    }
    sendResponse(res, {
        code : StatusCodes.ACCEPTED,
        message : "Recruiters get Successfully.",
        data : result
    })
})
const readSingleRecruiter = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const {RId} = req.params
    const result = await recruitersService.getSingleRecruiters(RId);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Didn't get Data Successfully!")
    }
    sendResponse(res, {
        code : StatusCodes.ACCEPTED,
        message : "Recruiters get Successfully.",
        data : result
    })
})

const updateRecruiter = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const payload = req.body
    const {RId} = req.params
    if (req.file) {
         payload.imageUrl =  `/uploads/recruiters/${req.file.filename}`
    }
    const result = await recruitersService.updateRecruiter(RId, payload);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Update unsuccessful!")
    }
    sendResponse(res, {
        code : StatusCodes.ACCEPTED,
        message : "Update Done Successfully",
        data : result
    })
})
const deleteRecruiter = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const {RId} = req.params
    const result = await recruitersService.deleteRecruiter(RId);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Delete unsuccessful!")
    }
    sendResponse(res, {
        code : StatusCodes.ACCEPTED,
        message : "Delete Done Successfully",
        data : result
    })
})

export const recruitersController = {
    createRecruiters,
    readAllRecruiter,
    readSingleRecruiter,
    deleteRecruiter, 
    updateRecruiter
}

