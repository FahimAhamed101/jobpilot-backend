import express from 'express';
import { AuthRoutes } from '../app/modules/Auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { JobRouter } from '../app/modules/job/job.route';
import { LibraryRoute } from '../app/modules/library/library.route';
import { faqRouter } from '../app/modules/FAQ/FAQ.route';
import { notificationRouter } from '../app/modules/notification/notification.route';
import { fcmTokenRouter } from '../app/modules/notification/fcmToken.routes';

import { paymentRoute } from '../app/modules/payment/payment.route';
import { privacyPolicyRouter } from '../app/modules/privacy&Policy/privacy&Policy.route';
import { recruiterRouter } from '../app/modules/recruiters/recruiters.route';
import { termsConditionRouter } from '../app/modules/terms&Condition/terms&Condition.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/fcm',
    route: fcmTokenRouter,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/job',
    route: JobRouter,
  },
  {
    path: '/library',
    route: LibraryRoute,
  },
  {
    path: '/faq',
    route: faqRouter,
  },
  {
    path: '/notifications',
    route: notificationRouter,
  },
  {
    path: '/payment',
    route: paymentRoute,
  },
  {
    path: '/privacy-policy',
    route: privacyPolicyRouter,
  },
  {
    path: '/recruiter',
    route: recruiterRouter,
  },
  {
    path: '/terms-condition',
    route: termsConditionRouter,
  },
];   

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
