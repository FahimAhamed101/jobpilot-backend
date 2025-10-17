// privacy&Policy.model.ts
import { Document, Schema, model } from 'mongoose';
import { TPrivacyPolicy } from './privacy&Policy.interface';

// Create the PrivacyPolicy Mongoose schema
const privacyPolicySchema = new Schema<TPrivacyPolicy>({
  text: { 
    type: String, 
    required: [true, 'Privacy policy text is required'],
    trim: true,
    minlength: [10, 'Privacy policy text must be at least 10 characters long']
  },
}, {
  timestamps: true, // Add createdAt and updatedAt
});

// Create the Mongoose model using the schema
export const PrivacyPolicyModel = model<TPrivacyPolicy>('PrivacyPolicy', privacyPolicySchema);