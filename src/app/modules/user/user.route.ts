import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { deleteUserValidationSchema, UserValidation } from './user.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import convertHeicToPngMiddleware from '../../middlewares/convertHeicToPngMiddleware';
import { USER_ROLE } from './user.constant';

const UPLOADS_FOLDER = 'uploads/users';
const upload = fileUploadHandler(UPLOADS_FOLDER);

const router = express.Router();

//create user
router
  .route('/create-user')
  .post(
    upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    },
    {
      name: "CV",
      maxCount:1
    },
    ]),
    convertHeicToPngMiddleware(UPLOADS_FOLDER),
    UserController.createUser
  );
  router.post(
    '/create-admin',
    upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    },
    {
      name: "CV",
      maxCount:1
    },
    ]),
    auth(USER_ROLE.superAdmin),
    UserController.createAdmin
  )
  router.post(
    '/create-analyst',
    upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    },
    {
      name: "CV",
      maxCount:1
    },
    ]),
    auth(USER_ROLE.superAdmin),
    UserController.createAnalyst
  )
  router.post(
    '/create-manual-user',
    upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    },
    {
      name: "CV",
      maxCount:1
    },
    ]),
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    UserController.createManualUser
  )
router.post(
  '/profile-image',
  upload.single('profileImage'),
  convertHeicToPngMiddleware(UPLOADS_FOLDER),
  UserController.updateUserImage
);
// router.post(
//   '/fill-up-user-data',
//   auth('common'),
//   uploadDrivingLicense.fields([
//     { name: 'drivingLicenseFront', maxCount: 1 },
//     { name: 'drivingLicenseBack', maxCount: 1 },
//   ]),
//   convertHeicToPngMiddleware(UPLOADS_DRIVING_LICENSE_FOLDER),
//   UserController.fillUpUserDetails
// );
// sub routes must be added after the main routes
router.get('/profile',auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst), UserController.getMyProfile);

router.patch(
  '/profile-update',
  auth(USER_ROLE.user),
  // validateRequest(UserValidation.updateUserValidationSchema),
  upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    },
    {
      name: "CV",
      maxCount:1
    },
    ]),
  convertHeicToPngMiddleware(UPLOADS_FOLDER),
  UserController.updateMyProfile
);

router.get(
  '/get-one-users/:id',
  auth('admin'),
  UserController.getSingleUserFromDB
);
router.post(
  '/delete-account',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
  // Remove temporarily
  UserController.deleteUserWithPassword
);

router.delete(
  '/delete/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin), // Only admin and superAdmin can delete users
  UserController.deleteUserById
);
router.patch(
  '/profile-update/:id',  // Add :id parameter
  auth(USER_ROLE.admin, USER_ROLE.superAdmin), // Only admin/superAdmin can update other users
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1
    },
    {
      name: "CV",
      maxCount: 1
    },
  ]),
  convertHeicToPngMiddleware(UPLOADS_FOLDER),
  UserController.updateUserById  // New controller method
);
//main routes
router
  .route('/')
  .get( auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst) ,UserController.getAllUsers)
  .delete( UserController.deleteMyProfile);
router.get(
  '/single-user/:id',
  UserController.getSingleUserById
)
router.get(
  '/search-user/:Uid',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserController.searchByUid
)
export const UserRoutes = router;
