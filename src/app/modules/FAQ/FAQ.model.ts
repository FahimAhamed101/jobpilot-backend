import mongoose, { Schema } from 'mongoose';
import { TFaq } from './FAQ.interface';

// Define the Mongoose Schema
const faqSchema = new Schema<TFaq>({
  question: { type: String, required: true },
  description: { type: String, required: true }
}, {
  timestamps: true, // Optional: Adds `createdAt` and `updatedAt` timestamps
});

// Create the Mongoose Model
export const FaqModel = mongoose.model<TFaq>('Faq', faqSchema);


