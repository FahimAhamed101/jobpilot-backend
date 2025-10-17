import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { jobService } from "./job.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { USER_ROLE } from "./user.constant"; 


const createAppliedJob = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log('📁 File received:', req.file);
    console.log('📦 Request body:', req.body);
    
    const payload = req.body;
    const adminId = req.user.id;
    
    // Handle file upload
    if (req.file) {
        payload.companyLogo = `/uploads/jobs/${req.file.filename}`;
        console.log('✅ Company logo path:', payload.companyLogo);
    } else {
        console.log('⚠️ No company logo file received');
    }
    
    const result = await jobService.createAppliedIntoDB({...payload, adminId});
    
    sendResponse(res, {
        code: StatusCodes.OK,
        message: "Job assigned successfully",
        data: result
    });
});

const getJobStatusPercentage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.query; // Optional: get specific user's data
  const currentUserId = req.user.id; // From auth middleware
  
  let result;
  
  // If user has 'user' role, only show their data
  if (req.user.role === USER_ROLE.user) {
    result = await jobService.getJobStatusPercentage(currentUserId);
  } 
  // If admin/analyst and specific userId provided, show that user's data
  else if (userId && typeof userId === 'string') {
    result = await jobService.getJobStatusPercentage(userId);
  }
  // Otherwise show all data (for admins)
  else {
    result = await jobService.getJobStatusPercentage();
  }

  sendResponse(res, {
    code: StatusCodes.OK,
    message: "Job status percentages retrieved successfully",
    data: result,
  });
});


const readAllJobApplied = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let { status, page, limit } = req.query;

    // Parse 'page' and 'limit' query parameters as numbers
    // Default to page 1 and limit 10 if not provided or invalid
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 20;

    let result;

    // Check if status is provided
    if (!status) {
        result = await jobService.readAllJobAppliedIntoDB(pageNumber, limitNumber);
    } else {
        // Pass the status from the query dynamically to filterByStatusFromDB
        result = await jobService.filterByStatusFromDB(status as string, pageNumber, limitNumber);
    }

    sendResponse(res, {
        code: StatusCodes.OK,
        message: "Get All job Applied Data!",
        data: result
    });
});


const readAllJobAppliedForSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let { status, page, limit } = req.query;
    const {id} = req.user

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 20;

   


    const  result = await jobService.filterByStatusForSingleUserFromDB(status as string, pageNumber, limitNumber, id);


    sendResponse(res, {
        code: StatusCodes.OK,
        message: "Get All job Applied Data!",
        data: result
    });
});


const readSingleJobApplied = catchAsync(async (req : Request , res : Response , next : NextFunction) => {
    const {appliedJobId} = req.params
    const result = await jobService.readSingleJobAppliedIntoDB(appliedJobId)
    sendResponse(res , {
        code : StatusCodes.OK,
        message : "Get single data!",
        data : result
    })
})
const updateJobApplied = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { appliedJobId } = req.params;
    
    console.log('📁 Update file received:', req.file);
    console.log('📦 Update payload:', payload);
    
    // Handle file upload for update
    if (req.file) {
        payload.companyLogo = `/uploads/jobs/${req.file.filename}`;
        console.log('✅ Updated company logo path:', payload.companyLogo);
    }
    
    const result = await jobService.updateJobAppliedIntoDB(appliedJobId, payload);
    
    sendResponse(res, {
        code: StatusCodes.OK,
        message: "Update Successful.",
        data: result
    });
});

const deleteAppliedJob = catchAsync(async (req : Request , res : Response , next : NextFunction) => {
    const {appliedJobId} = req.params;
    const result = await jobService.deleteAppliedJobFromDB(appliedJobId);
    sendResponse(res , {
        code : StatusCodes.OK,
        message : "Delete Successful",
        data : result
    })
})


// const filterByStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const { status } = req.query;

//     // Check if status is provided
//     if (!status) {
//         return next(new ApiError(StatusCodes.BAD_REQUEST, "Status query parameter is required"));
//     }

//     const result = await jobService.filterByStatusFromDB(status as string); // Type assertion for status
//     res.status(StatusCodes.OK).json({ success: true, data: result });
// });

const dashboardData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {period} = req.query;
    console.log('..........' ,period)
  // Ensure 'period' is a string and is one of 'day', 'week', or 'month'
  if (typeof period === 'string' && ['day', 'week', 'month'].includes(period)) {
    const result = await jobService.dashboardDataFromDB(period as 'day' | 'week' | 'month');
    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Your dashboard data retrieved successfully',
      data: result,
    });
  } else {

    const result = await jobService.dashboardAllDataNoTimePeriodFromDB();
    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Your dashboard data retrieved successfully".',
      data : result
    });
  }
});

const dashboardDataFromSpecificMonth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Extract month and year from query parameters
    const { month, year } = req.query;

    // Convert month and year to numbers
    const monthNumber = Number(month);  // Convert to number
    const yearNumber = Number(year);    // Convert to number

    // Ensure the month and year are valid numbers
    if (isNaN(monthNumber) || isNaN(yearNumber)) {
        return next(new Error("Invalid month or year"));
    }

    // Pass the numbers to the service
    const result = await jobService.dashboardDataFromSpecificMonth(monthNumber, yearNumber);

    // Send the response
    sendResponse(res, {
        code: StatusCodes.OK,
        message: "Your dashboard data fetched successfully",
        data: result
    });
});

const getUserJobData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.user
    console.log(req.user)
    const result = await jobService.getUserJobData(id);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Data Found!")
    } 
    sendResponse(res, {
        code : StatusCodes.OK,
        message : "All Data Get Successfully.",
        data : result
    })
})

export const jobController = {
    createAppliedJob,
    readAllJobApplied,
    readSingleJobApplied, getJobStatusPercentage,
    updateJobApplied,
    deleteAppliedJob,
    dashboardData,
    readAllJobAppliedForSingleUser,
    dashboardDataFromSpecificMonth,
    getUserJobData
}