import express from 'express'
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { paymentController } from './payment.controller';
import validateRequest from '../../middlewares/validateRequest';
import { paymentValidation } from './payment.validation';

const router = express.Router();

router.post(
    '/create',
    validateRequest(paymentValidation.paymentValidationSchema),
    auth(USER_ROLE.user),
    paymentController.createPayment
)

router.get(
    '/read-single/:paymentId',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst, USER_ROLE.user),
    paymentController.getSinglePayment
)
router.get(
    '/read-all',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
    paymentController.getAllPayment
)
router.get(
    '/read-single-under-user',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst, USER_ROLE.user),
    paymentController.getAllPaymentUnderUser
)


export const paymentRoute = router