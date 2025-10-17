import { Document } from 'mongoose';

// Define the TypeScript interface for PrivacyPolicy
export type TPrivacyPolicy = Document & {
  text: string;
}