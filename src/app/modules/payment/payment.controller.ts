import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { paymentService } from "./payment.service";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";

const createPayment = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const payload = req.body;
    const {id} = req.user;
    const result = await paymentService.createPaymentToDB(payload, id);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Something Went Wrong!" )
    }   
    sendResponse(res,{
        code : StatusCodes.OK,
        message : "Payment Done Successfully.",
        data : result
    })
})

const getAllPayment = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const result = await paymentService.getAllPaymentFromDB();
    if (!result || (await result).length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Data Found!")
    }
    sendResponse(res, {
        code : StatusCodes.OK,
        message : "Get All Payment Data Successfully.",
        data : result
    })
})
const getSinglePayment = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const {paymentId} = req.params;
    const result = await paymentService.getSinglePaymentFromDB(paymentId);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Data Found!")
    }
    sendResponse(res, {
        code : StatusCodes.OK,
        message : "Get Single Payment Data Successfully.",
        data : result
    })
})

const getAllPaymentUnderUser = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const {id} = req.user;
    const result = await paymentService.getAllPaymentUnderUserFromDB(id);
    if (!result || result.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Data Found!")
    }  
    sendResponse(res,{
        code : StatusCodes.OK,
        message : "Get All payment Data Under User",
        data : result
    })
})

export const paymentController = {
    createPayment,
    getAllPayment,
    getSinglePayment,
    getAllPaymentUnderUser
}