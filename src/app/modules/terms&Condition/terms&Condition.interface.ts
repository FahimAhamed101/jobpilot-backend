import { Document } from 'mongoose';

// Define the TypeScript interface for PrivacyPolicy
export type TTermsCondition = Document & {
  text: string;
}