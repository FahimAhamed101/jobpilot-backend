import { z } from 'zod';

// Define Zod validation schema for Notification
export const NotificationSchema = z.object({
  body : z.object({
    text: z.string().min(1, "Text is required"), // Ensures text is a non-empty string
    userId: z.string().length(24, "userId should be a valid ObjectId"), // Validates ObjectId length
  })
});
