import cors from 'cors';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser'; 
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import notFound from './app/middlewares/notFount';
import { AuthRoutes } from './app/modules/Auth/auth.route';
import path from 'path';
import { SocialAuthRoutes } from './app/modules/Auth/social.auth.routes';
// import passport from 'passport';
// import session from 'express-session';

const app = express();

// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// body parser
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use((req: Request, res: Response, next) => {
  const contentType = req.headers['content-type'] || '';
  
  // Skip all body parsing for multipart/form-data (let multer handle it in routes)
  if (contentType.includes('multipart/form-data')) {
    return next();
  }
  
  // For other content types, apply appropriate parser
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use cookie-parser to parse cookies
app.use(cookieParser());

// Setup session and passport
// app.use(session({
//   secret: 'your-session-secret',
//   resave: false,
//   saveUninitialized: true,
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// file retrieve
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Auth routes
app.use('/api/v1/auth', AuthRoutes);

// Social auth routes - ADD THIS LINE
app.use('/api/v1/social', SocialAuthRoutes);

// Test route (optional - you can remove this if you want)
app.get('/api/v1/social/test', (req: Request, res: Response) => {
  console.log("✅ Social test route is working!");
  res.status(200).json({ message: 'Social routes are working!' });
});

// router
app.use('/api/v1', router);

// live response
app.get('/test', (req: Request, res: Response) => {
  res.status(201).json({ message: 'Welcome to Backend Template Server123' });
});

// app.get('/test', (req: Request, res: Response) => {
//   res.status(201).json({ message: 'Welcome to Backend Template Server' });
// });

// global error handle
app.use(globalErrorHandler);

// handle not found route
app.use(notFound);

export default app;