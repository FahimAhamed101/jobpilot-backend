import { USER_ROLE } from './../user/user.constant';
import express from 'express'
import validateRequest from '../../middlewares/validateRequest';
import { jobValidationSchema } from './job.validation';
import { jobController } from './job.controller';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const UPLOADS_FOLDER = 'uploads/jobs';
const upload = fileUploadHandler(UPLOADS_FOLDER);

const router = express.Router();

router.post(
    '/create',
    upload.single('companyLogo'),
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    // validateRequest(jobValidationSchema),
    jobController.createAppliedJob
)
router.get(
    '/get-all', // status as query
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin),
    jobController.readAllJobApplied
)    
router.get(
    '/get-one-user-jobs', // status as query
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin, USER_ROLE.user),
    jobController.readAllJobAppliedForSingleUser
)    
router.get(
    '/get-single/:appliedJobId',
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin, USER_ROLE.user),
    auth('admin'),
    jobController.readSingleJobApplied
) 
router.patch(
    '/update/:appliedJobId',
    upload.single('companyLogo'),
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin),
    jobController.updateJobApplied
)
router.delete(
    '/delete/:appliedJobId',
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin),
    jobController.deleteAppliedJob
) 

// router.get(
//     '/filter-by-status', // status
//     auth('admin'),
//     jobController.filterByStatus // This calls the filterByStatus controller
// );

router.get(
    '/dashboard-data', // period in query
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin),
    jobController.dashboardData
)
router.get(
    '/dashboard-data-for-specific-month',
    auth(USER_ROLE.admin , USER_ROLE.analyst, USER_ROLE.superAdmin),
    jobController.dashboardDataFromSpecificMonth
)
router.get(
  '/status-percentage',
  auth(USER_ROLE.admin, USER_ROLE.analyst, USER_ROLE.superAdmin, USER_ROLE.user),
  jobController.getJobStatusPercentage
);
router.get(
    '/get-user-dashboard',
    auth(USER_ROLE.user),
    jobController.getUserJobData
)

export const JobRouter = router