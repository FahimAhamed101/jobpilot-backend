import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { TFaq } from "./FAQ.interface";
import { FaqModel } from "./FAQ.model";

const createFaqIntoDB = async (payload : TFaq) => {
    const result = await FaqModel.create(payload);
    return result
}

const updateFaqIntoDB = async (payload : TFaq, id : string) => {
    const result = await FaqModel.findByIdAndUpdate(id, payload, {new : true})
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Update Failed");
    }
    return result
}

const readAllFaqFromDB = async () => {
    const result = await FaqModel.find({});
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No FAQ Found!")
    }
    return result
}

const readSingleFaqFromDB = async (id : string) => {
    const result = await FaqModel.findById(id);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No FAQ Found");
    }
    return result
}

const deleteFaqFromDB = async (id : string) => {
    const result = await FaqModel.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Delete Failed");
    }
    return result
}

export const faqService = {
    createFaqIntoDB,
    updateFaqIntoDB,
    readAllFaqFromDB,
    readSingleFaqFromDB,
    deleteFaqFromDB
}