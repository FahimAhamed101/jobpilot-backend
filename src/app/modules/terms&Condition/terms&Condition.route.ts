import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { termsConditionController } from './terms&Condition.controller';

const router = express.Router();

// Create terms and conditions route
router.post(
    '/create',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    termsConditionController.createTermsCondition
);

router.patch(
    '/update/:termsConditionId',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    termsConditionController.updateTermsCondition
);

router.get(
    '/read',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst, USER_ROLE.user),
    termsConditionController.readTermsCondition
);

export const termsConditionRouter = router;