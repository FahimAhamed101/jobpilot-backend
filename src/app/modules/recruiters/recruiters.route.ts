import { USER_ROLE } from './../user/user.constant';
import express from 'express'
import auth from '../../middlewares/auth';
import { recruitersController } from './recruiters.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const UPLOADS_FOLDER = 'uploads/recruiters';
const upload = fileUploadHandler(UPLOADS_FOLDER);

const router = express.Router()



router.post(
    '/create',
    upload.single('imageUrl'),
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    recruitersController.createRecruiters
)

router.patch(
    '/update/:RId',
    upload.single('imageUrl'),
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    recruitersController.updateRecruiter
)

router.get(
    '/get-all',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst, USER_ROLE.user),
    recruitersController.readAllRecruiter
)
router.get(
    '/get-single/:RId',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst, USER_ROLE.user),
    recruitersController.readSingleRecruiter
)

router.delete(
    '/delete/:RId',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    recruitersController.deleteRecruiter
)


export const recruiterRouter  = router;