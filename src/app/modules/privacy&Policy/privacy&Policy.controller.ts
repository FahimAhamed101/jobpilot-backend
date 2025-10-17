// privacy&Policy.controller.ts
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { privacyPolicyService } from "./privacy&Policy.service";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";

const createPrivacyPolicy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    
    // Validate that text is provided
    if (!payload.text || payload.text.trim() === '') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Privacy policy text is required!");
    }

    const result = await privacyPolicyService.createPrivacyPolicyInDB(payload);
    
    sendResponse(res, {
        code: StatusCodes.OK,
        message: "Privacy Policy created successfully!",
        data: result
    });
});

const updatePrivacyPolicy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { privacyPolicyId } = req.params;
    
    // Validate that text is provided for update
    if (!payload.text || payload.text.trim() === '') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Privacy policy text is required for update!");
    }

    const result = await privacyPolicyService.updatePrivacyPolicyFromDB(payload, privacyPolicyId);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Privacy Policy Not Update Successfully!");
    }
    
    sendResponse(res, {
        code: StatusCodes.OK,
        message: "Successfully Updated",
        data: result
    });
});

const readPrivacyPolicy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await privacyPolicyService.readPrivacyPolicyFromDB();
    if (!result || result.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No Privacy Policy Data Found");
    }
    
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Get privacy policy data successfully!',
        data: result
    });
});

export const privacyPolicyController = {
    createPrivacyPolicy,
    updatePrivacyPolicy,
    readPrivacyPolicy
};