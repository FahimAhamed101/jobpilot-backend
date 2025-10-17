import { USER_ROLE } from './../user/user.constant';
import express from 'express'
import auth from '../../middlewares/auth'
import { faqController } from './FAQ.controller'

const router = express.Router()
// post , get , get single , update, delete
router.post(
    '/create',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    faqController.createFaq
)
router.patch(
    '/update/:faqId',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    faqController.updateFaq
)
router.get(
    '/read-all',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.analyst, USER_ROLE.user),
    faqController.readAllFaq
)

router.get(
    '/get-single-faq/:faqId',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    faqController.readSingleFaq
)

router.delete(
    '/delete/:faqId',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    faqController.deleteFaq
)


export const faqRouter = router