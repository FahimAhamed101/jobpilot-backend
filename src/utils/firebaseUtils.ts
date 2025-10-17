import * as admin from 'firebase-admin';
import { NotificationModel } from '../app/modules/notification/notification.model';
import { Schema } from 'mongoose';

// Initialize Firebase Admin SDK (ensure it's only done once)
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true; // Set flag to true to prevent re-initialization
  }
};

// This function can now be reused in your services or utils as needed
export const sendPushNotification = async (
  registrationToken: string,
  title: string,
  messageBody: string | number,
  userId: Schema.Types.ObjectId,
  timeBefore: number
): Promise<void> => {
  try {
    // Initialize Firebase Admin SDK only once
    initializeFirebase();

    const message = {
      notification: {
        title,
        body: messageBody.toString(), // Ensure it's a string
      },
      token: registrationToken,
    };

    // Send the notification
    await admin.messaging().send(message);
    
    // Log the notification in the database
    await NotificationModel.create({ title, messageBody, userId, timeBefore });

    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Error sending notification');
  }
};
