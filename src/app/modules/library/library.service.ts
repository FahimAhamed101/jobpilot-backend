import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { TFileUpload } from "./library.interface";
import { LibraryModel } from "./library.model";

const createLibraryItem = async (payload : TFileUpload) => {
    const result = await LibraryModel.create(payload);
    if (!result ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Library is not Created successfully!")
    }
    return result 
}

const readAllCreateLibraryItem = async (page: number, limit: number) => {
    // Calculate the number of records to skip based on the current page
    const skip = (page - 1) * limit;

    // Find the records with pagination and sorted by createdAt in descending order
    const result = await LibraryModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)  // Skip the records based on the page
        .limit(limit);  // Limit the number of records to 'limit'

    // If no results are found, throw an error
    if (!result || result.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Data Exist in DB!");
    }

    return result;
}


const deleteLibraryItem = async (id : string) => {
    const result = await LibraryModel.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "This item is not deleted!")
    }
    return result
} 

const getOneItemByIdFromDB = async (itemId : string) => {
    const result = await LibraryModel.findById(itemId);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Data Found With this Id");
    }

    return result

}

const updateLibraryItem = async (LId : string ,payload : Partial<TFileUpload>) => {
    const result = await LibraryModel.findByIdAndUpdate(LId ,payload, {new : true});
    if (!result ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Library is not Created successfully!")
    }
    return result 
}


export const libraryService = {
    createLibraryItem,
    readAllCreateLibraryItem,
    deleteLibraryItem,
    getOneItemByIdFromDB,
    updateLibraryItem
}