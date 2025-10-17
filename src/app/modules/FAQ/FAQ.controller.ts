import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { faqService } from "./FAQ.service";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";

const createFaq = catchAsync(async (req : Request, res : Response, next : NextFunction)=> {
    const payload = req.body
    const result = await faqService.createFaqIntoDB(payload);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed create faq!")
    }
    sendResponse(res, {
        code : StatusCodes.OK,
        message : 'FAQ Created Successfully!',
        data : result
    })
})
const updateFaq = catchAsync(async (req : Request, res : Response, next : NextFunction)=> {
    const payload = req.body;
    const {faqId} = req.params;
    const result = await faqService.updateFaqIntoDB( payload, faqId);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Update Failed!");
    }
    sendResponse(res, {
        code : StatusCodes.OK,
        message : "Successfully Update.",
        data : result
    })
})
const readSingleFaq = catchAsync(async (req : Request, res : Response, next : NextFunction)=> {
    const {faqId} = req.params
    const result = await faqService.readSingleFaqFromDB(faqId)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Didn't get Data!")
    }
    sendResponse(res, {
        code : StatusCodes.OK,
        message : "Successfully Get Single Faq.",
        data : result
    })
})
const readAllFaq = catchAsync(async (req : Request, res : Response, next : NextFunction)=> {
    const result = await faqService.readAllFaqFromDB();
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Didn't Get All Faq");
    }
    sendResponse(res, {
        code : StatusCodes.OK,
        message : "Get All Faq Successfully.",
        data : result
    })
})
const deleteFaq = catchAsync(async (req : Request, res : Response, next : NextFunction)=> {
    const {faqId} = req.params
    const result = await faqService.deleteFaqFromDB(faqId);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Delete Failed!")
    }
    sendResponse(res, {
        code : StatusCodes.OK,
        message : "Delete Done Successfully.",
        data : result
    })
})

export const faqController = {
    createFaq,
    readAllFaq,
    readSingleFaq,
    updateFaq,
    deleteFaq
} 
