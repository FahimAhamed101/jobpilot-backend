import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { TJob } from "./job.interface"
import { JobModel } from "./job.model"
import { User } from "../user/user.model";
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths, endOfDay, endOfWeek, endOfMonth } from 'date-fns';
import { Types } from 'mongoose';



const getJobStatusPercentage = async (userId?: string) => {
  let matchStage: any = {};
  
  // If userId is provided, filter by specific user
  if (userId && Types.ObjectId.isValid(userId)) {
    matchStage.userId = new Types.ObjectId(userId);
  }

  const result = await JobModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        statuses: {
          $push: {
            status: '$_id',
            count: '$count',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        statuses: {
          $map: {
            input: '$statuses',
            as: 'status',
            in: {
              status: '$$status.status',
              count: '$$status.count',
            },
          },
        },
        total: 1,
      },
    },
  ]);

  // If no documents found, return default structure
  if (result.length === 0) {
    const defaultStatuses = ['Shortlisted', 'Interview', 'Rejected', 'Offers'];
    return {
      statuses: defaultStatuses.map(status => ({
        status,
        count: 0,
        percentage: 0,
      })),
      total: 0,
    };
  }

  // Calculate total excluding "Applied" status
  const statusesWithoutApplied = result[0].statuses.filter((s: any) => s.status !== 'Applied');
  const totalWithoutApplied = statusesWithoutApplied.reduce((sum: number, s: any) => sum + s.count, 0);

  // Calculate percentages based on total without "Applied"
  const statusesWithPercentage = result[0].statuses.map((s: any) => {
    let percentage = 0;
    
    if (s.status !== 'Applied') {
      // For non-Applied statuses, calculate percentage based on total without Applied
      percentage = totalWithoutApplied > 0 ? (s.count / totalWithoutApplied) * 100 : 0;
    }
    // Applied status will have 0 percentage in this calculation
    
    return {
      status: s.status,
      count: s.count,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    };
  });

  // Filter out Applied status if you don't want it in the response at all
  const filteredStatuses = statusesWithPercentage.filter((s: any) => s.status !== 'Applied');

  return {
    statuses: filteredStatuses,
    total: result[0].total,
    totalWithoutApplied, // Optional: include this if needed
  };
};

const createAppliedIntoDB = async (payload: TJob) => {
    console.log('🎯 Creating job with payload:', {
        companyName: payload.companyName,
        jobTitle: payload.jobTitle,
        companyLogo: payload.companyLogo,
        userId: payload.userId
    });
    
    const result = await JobModel.create(payload);
    
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Job assignment creation failed");
    }
    
    console.log('✅ Job created successfully:', {
        id: result._id,
        companyLogo: result.companyLogo
    });
    
    return result;
}

const readAllJobAppliedIntoDB = async (page: number, limit: number) => {
    const result = await JobModel.find({})
        .populate('userId', 'firstName lastName email profileImage')
        .populate('adminId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    if (!result || result.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Data Found!");
    }

    // Transform the data with proper company logo URLs
    const transformedResult = result.map(job => {
        const jobObj = job.toObject();
        
        return {
            ...jobObj,
            companyLogo: jobObj.companyLogo ? jobObj.companyLogo : null,
            userInfo: jobObj.userId ? {
                firstName: (jobObj.userId as any).firstName,
                lastName: (jobObj.userId as any).lastName,
                email: (jobObj.userId as any).email,
                profileImage: (jobObj.userId as any).profileImage
            } : null,
            adminInfo: jobObj.adminId ? {
                firstName: (jobObj.adminId as any).firstName,
                lastName: (jobObj.adminId as any).lastName,
                email: (jobObj.adminId as any).email
            } : null
        };
    });

    return transformedResult;
};
const readSingleJobAppliedIntoDB = async (appliedJobId : string) => {
    const result =  await JobModel.findOne({_id : appliedJobId})
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No Data Found")
    }
    return result
}

const updateJobAppliedIntoDB = async (appliedJobId : string, payload : Partial<TJob>) => {
    const result = await JobModel.findByIdAndUpdate(appliedJobId, payload, {new : true});
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Update failed!")
    }
    return result
}

const deleteAppliedJobFromDB = async (appliedJobId : string) => {
    const result = await JobModel.findByIdAndDelete(appliedJobId);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Delete Failed")
    }
    return result
}  

const filterByStatusFromDB = async (status: string, page: number, limit: number) => {
  console.log("status====>>>", typeof(status))
    const result = await JobModel.find({ status : status })
        .sort({ createdAt: -1 })  // Sort by descending order
        .skip((page - 1) * limit) // Skip (page - 1) * limit records
        .limit(limit); // Limit to the specified number of records

    if (!result || result.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Didn't find any data!");
    }

    return result;
};
const filterByStatusForSingleUserFromDB = async (status: string, page: number, limit: number, id : string) => {
  console.log("status====>>>", typeof(status))
  let result;
    
  if (status) {
    result = await JobModel.find({ userId : id , status : status })
        .sort({ createdAt: -1 })  // Sort by descending order
        .skip((page - 1) * limit) // Skip (page - 1) * limit records
        .limit(limit); // Limit to the specified number of records

  } else {
    result = await JobModel.find({ userId : id })
        .sort({ createdAt: -1 })  // Sort by descending order
        .skip((page - 1) * limit) // Skip (page - 1) * limit records
        .limit(limit); // Limit to the specified number of records

  }
    if (!result || result.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Didn't find any data!");
    }

    return result;
};


const getTimeRange = (period: 'day' | 'week' | 'month', date = new Date()) => {
  switch (period) {
    case 'day':
      return { start: startOfDay(date), end: endOfDay(date) };
    case 'week':
      return { start: startOfWeek(date), end: endOfWeek(date) };
    case 'month':
      return { start: startOfMonth(date), end: endOfMonth(date) };
    default:
      throw new Error('Invalid period');
  }
};

const getPreviousTimeRange = (period: 'day' | 'week' | 'month', date = new Date()) => {
  switch (period) {
    case 'day':
      return { start: startOfDay(subDays(date, 1)), end: endOfDay(subDays(date, 1)) };
    case 'week':
      return { start: startOfWeek(subWeeks(date, 1)), end: endOfWeek(subWeeks(date, 1)) };
    case 'month':
      return { start: startOfMonth(subMonths(date, 1)), end: endOfMonth(subMonths(date, 1)) };
    default:
      throw new Error('Invalid period');
  }
};

const dashboardDataFromDB = async (period: 'day' | 'week' | 'month') => {
  const currentRange = getTimeRange(period); // Get current period range
  const previousRange = getPreviousTimeRange(period); // Get previous period range

  // Get counts for the current period
  const [userCountCurrent, jobCountCurrent, appliedJobCountCurrent, interviewScheduledJobsCurrent] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: currentRange.start, $lte: currentRange.end } }),
    JobModel.countDocuments({ createdAt: { $gte: currentRange.start, $lte: currentRange.end } }),
    JobModel.countDocuments({ status: "Applied", createdAt: { $gte: currentRange.start, $lte: currentRange.end } }),
    (await JobModel.find({ status: "Interview", createdAt: { $gte: currentRange.start, $lte: currentRange.end } })).length,
  ]);

  // Get counts for the previous period
  const [userCountPrevious, jobCountPrevious, appliedJobCountPrevious, interviewScheduledJobsPrevious] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: previousRange.start, $lte: previousRange.end } }),
    JobModel.countDocuments({ createdAt: { $gte: previousRange.start, $lte: previousRange.end } }),
    JobModel.countDocuments({ status: "Applied", createdAt: { $gte: previousRange.start, $lte: previousRange.end } }),
    JobModel.find({ status: "Interview", createdAt: { $gte: previousRange.start, $lte: previousRange.end } }),
  ]);

  // Log the counts for debugging
  console.log("userCountCurrent==>> ", userCountCurrent);
  console.log("userCountPrevious==>> ", userCountPrevious);
  console.log("jobCountCurrent==>> ", jobCountCurrent);
  console.log("jobCountPrevious==>> ", jobCountPrevious);

  // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    // If both current and previous are 0, there is no change
    if (previous === 0 && current === 0) {
      return 0;  // No change
    }
    // If previous is 0 and current is not 0, the change is 100%
    if (previous === 0 && current !== 0) {
      return 100; // 100% increase
    }
    // Standard calculation for percentage change
    return ((current - previous) / previous) * 100;
  };
  console.log("userCountCurrent==> In Below> ", userCountPrevious);
  return {
    userCountCurrent,
    jobCountCurrent,
    appliedJobCountCurrent,
    interviewScheduledJobsCurrent,
    userCountPercentageChange: calculatePercentageChange(userCountCurrent, userCountPrevious),
    jobCountPercentageChange: calculatePercentageChange(jobCountCurrent, jobCountPrevious),
    appliedJobCountPercentageChange: calculatePercentageChange(appliedJobCountCurrent, appliedJobCountPrevious),
    interviewScheduledJobsPercentageChange: calculatePercentageChange(interviewScheduledJobsCurrent, interviewScheduledJobsPrevious.length),
  };
};

const dashboardAllDataNoTimePeriodFromDB = async () => {
  // Get counts for the current period (all time)
  const [userCountCurrent, jobCountCurrent, appliedJobCountCurrent, interviewScheduledJobsCurrent] = await Promise.all([
    User.countDocuments(), // Count all users (no time range filter)
    JobModel.countDocuments(), // Count all jobs (no time range filter)
    JobModel.countDocuments({ status: "Applied" }), // Count all applied jobs
    (await JobModel.find({ status: "Interview" })).length, // Count all interview-scheduled jobs
  ]);

  // Calculate percentage change (using dummy previous values for now as there is no previous period concept here)
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0 && current === 0) {
      return 0;  // No change
    }
    if (previous === 0 && current !== 0) {
      return 100; // 100% increase
    }
    return ((current - previous) / previous) * 100; // Standard percentage change formula
  };

  // Returning data (no previous period concept here)
  return {
    userCountCurrent,
    jobCountCurrent,
    appliedJobCountCurrent,
    interviewScheduledJobsCurrent,
    userCountPercentageChange: calculatePercentageChange(userCountCurrent, 0), // Since no previous data is available, assuming 0 as previous
    jobCountPercentageChange: calculatePercentageChange(jobCountCurrent, 0),
    appliedJobCountPercentageChange: calculatePercentageChange(appliedJobCountCurrent, 0),
    interviewScheduledJobsPercentageChange: calculatePercentageChange(interviewScheduledJobsCurrent, 0),
  };
};


const dashboardDataFromSpecificMonth = async (month: number, year: number) => {
  // Get the start and end date for the given month and year
  const currentRangeStart = new Date(year, month - 1, 1); // Month is 0-based, so subtract 1
  const currentRangeEnd = new Date(year, month, 0); // The last day of the month

  // Get the previous month
  let previousMonth = month - 1;
  let previousYear = year;

  if (previousMonth === 0) {
    previousMonth = 12; // December
    previousYear -= 1;
  }

  // Get the start and end date for the previous month
  const previousRangeStart = new Date(previousYear, previousMonth - 1, 1); 
  const previousRangeEnd = new Date(previousYear, previousMonth, 0);

  // Get counts for the specified month
  const [userCountCurrent, jobCountCurrent, appliedJobCountCurrent, interviewScheduledJobsCurrent] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: currentRangeStart, $lte: currentRangeEnd } }),
    JobModel.countDocuments({ createdAt: { $gte: currentRangeStart, $lte: currentRangeEnd } }),
    JobModel.countDocuments({ status: "Applied", createdAt: { $gte: currentRangeStart, $lte: currentRangeEnd } }),
    (await JobModel.find({ status: "Interview", createdAt: { $gte: currentRangeStart, $lte: currentRangeEnd } })).length,
  ]);

  // Get counts for the previous month
  const [userCountPrevious, jobCountPrevious, appliedJobCountPrevious, interviewScheduledJobsPrevious] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: previousRangeStart, $lte: previousRangeEnd } }),
    JobModel.countDocuments({ createdAt: { $gte: previousRangeStart, $lte: previousRangeEnd } }),
    JobModel.countDocuments({ status: "Applied", createdAt: { $gte: previousRangeStart, $lte: previousRangeEnd } }),
    JobModel.find({ status: "Interview", createdAt: { $gte: previousRangeStart, $lte: previousRangeEnd } }),
  ]);

 // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    // If both current and previous are 0, there is no change
    if (previous === 0 && current === 0) {
      return 0;  // No change
    }
    // If previous is 0 and current is not 0, the change is 100%
    if (previous === 0 && current !== 0) {
      return 100; // 100% increase
    }
    // Standard calculation for percentage change
    return ((current - previous) / previous) * 100;
  };



  return {
    userCountCurrent,
    jobCountCurrent,
    appliedJobCountCurrent,
    interviewScheduledJobsCurrent,
    userCountPercentageChange: calculatePercentageChange(userCountCurrent, userCountPrevious),
    jobCountPercentageChange: calculatePercentageChange(jobCountCurrent, jobCountPrevious),
    appliedJobCountPercentageChange: calculatePercentageChange(appliedJobCountCurrent, appliedJobCountPrevious),
    interviewScheduledJobsPercentageChange: calculatePercentageChange(interviewScheduledJobsCurrent, interviewScheduledJobsPrevious.length),
  };
};

const getUserJobData = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId');
  }

  const oid = new Types.ObjectId(userId);

  // Aggregate counts per status
  const countsAgg = await JobModel.aggregate<{ _id: string; count: number }>([
    { $match: { userId: oid } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Default status counts
  const base = {
    Applied: 0,
    Shortlisted: 0,
    Rejected: 0,
    Interview: 0,
    Offers: 0,
  };

  // Cast _id to keyof base to ensure it matches one of the valid statuses
  countsAgg.forEach(row => {
    if (row._id in base) {
      base[row._id as keyof typeof base] = row.count;
    }
  });

  const total = Object.values(base).reduce((a, b) => a + b, 0);

  // Return both status counts and full job data
  const jobs = await JobModel.find({ userId: oid }).sort({ appliedDate: -1 }).lean();

  return { userId, total, counts: base, jobs };
};


export const jobService = {
    createAppliedIntoDB,
    readAllJobAppliedIntoDB,
    readSingleJobAppliedIntoDB,
    updateJobAppliedIntoDB,
    deleteAppliedJobFromDB,
    filterByStatusFromDB,
    filterByStatusForSingleUserFromDB,
    dashboardDataFromDB,
    dashboardDataFromSpecificMonth,
    getUserJobData,getJobStatusPercentage,
    dashboardAllDataNoTimePeriodFromDB
}