import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Load environment variables from .env file
dotenv.config();

// Ensure the environment variables are defined
const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

if (!projectId || !privateKey || !clientEmail) {
  throw new Error('Firebase credentials are not set in environment variables.');
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    privateKey: privateKey.replace(/\\n/g, '\n'),  // Handle \n correctly
    clientEmail,
  }),
});

export default admin;
