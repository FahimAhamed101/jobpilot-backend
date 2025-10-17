import path from 'path';
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { libraryService } from "./library.service";
import sendResponse from "../../../shared/sendResponse";
import getVideoDurationInSeconds from "get-video-duration";

const createLibraryItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const files = req.files as { 
        fileUrl?: { filename: string }[]; 
        thumbnailUrl?: { filename: string }[]; 
    };

    // Handle main file (video)
    if (files?.fileUrl && files.fileUrl[0]?.filename) {
        const fileName = files.fileUrl[0].filename;

        // Set the file URL (this will be stored in DB or sent to frontend)
        payload.fileUrl = `/uploads/library/${fileName}`;

        // Get absolute file path to read locally
        const filePath = path.resolve(process.cwd(), 'uploads', 'library', fileName);

        console.log('Resolved File Path:', filePath);

        if (fs.existsSync(filePath)) {
            console.log('File exists at path:', filePath);
            try {
                const durationInSeconds = await getVideoDurationInSeconds(filePath);
                const minutes = Math.floor(durationInSeconds / 60);
                const seconds = Math.floor(durationInSeconds % 60);
                payload.videoDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } catch (err) {
                console.error('Error fetching video duration:', err);
                payload.videoDuration = null;
            }
        } else {
            console.error('File does not exist at path:', filePath);
            payload.videoDuration = null;
        }
    }

    // Handle thumbnail
    if (files?.thumbnailUrl && files.thumbnailUrl[0]?.filename) {
        payload.thumbnailUrl = `/uploads/library/${files.thumbnailUrl[0].filename}`;
    }

    // Save to DB
    const result = await libraryService.createLibraryItem(payload);

    sendResponse(res, { 
        code: 201, 
        message: "Library Created successfully.", 
        data: result 
    });
});



const readAllCreateLibraryItem = async (req : Request, res : Response, next : NextFunction) => {
  const {page, limit} = req.query

  const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 20;
    const result = await libraryService.readAllCreateLibraryItem(pageNumber, limitNumber);
    sendResponse(res, {
        code : 200,
        message : "Library Items Get successfully.",
        data : result
    })
}

const deleteLibraryItem = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
       const {id} = req.params
       const result = await libraryService.deleteLibraryItem(id);
       sendResponse(res, {
        code : 200,
        message : "Library Items Delete successfully.",
        data : result
    })
})

const getOneItemById = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
  const {itemId} = req.params
  const result = await libraryService.getOneItemByIdFromDB(itemId);
    sendResponse(res, {
        code : 200,
        message : "Library Item Get successfully.",
        data : result
    })
})

const updateLibraryItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {LId} = req.params
    const payload = req.body;
    const files = req.files as { 
        fileUrl?: { filename: string }[]; 
        thumbnailUrl?: { filename: string }[]; 
    };

    if (files?.fileUrl && files.fileUrl[0]?.filename) {
        // Correct path from project root
        const filePath = path.resolve(process.cwd(), 'uploads', 'library', files.fileUrl[0].filename);

        console.log('Resolved File Path:', filePath);

        if (fs.existsSync(filePath)) {
            console.log('File exists at path:', filePath);

            try {
                const durationInSeconds = await getVideoDurationInSeconds(filePath);
                const minutes = Math.floor(durationInSeconds / 60);
                const seconds = Math.floor(durationInSeconds % 60);
                payload.videoDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } catch (err) {
                console.error('Error fetching video duration:', err);
                payload.videoDuration = null;
            }
        } else {
            console.error('File does not exist at path:', filePath);
            payload.videoDuration = null;
        }
    }

    if (files?.thumbnailUrl && files.thumbnailUrl[0]?.filename) {
        payload.thumbnailUrl = `/uploads/library/${files.thumbnailUrl[0].filename}`;
    }

    const result = await libraryService.updateLibraryItem(LId ,payload);

    sendResponse(res, { code: 201, message: "Library update successfully.", data: result });
});

export const libraryController = {
    createLibraryItem,
    readAllCreateLibraryItem,
    deleteLibraryItem,
    getOneItemById,
    updateLibraryItem
}