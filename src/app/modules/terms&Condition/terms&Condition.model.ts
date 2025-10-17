import { Document, Schema, model } from 'mongoose';
import { TTermsCondition } from './terms&Condition.interface';
// Create the PrivacyPolicy Mongoose schema
const termsConditionSchema = new Schema<TTermsCondition>({
  text: { type: String, required: true }, // This will store the text of the privacy policy
});

// Create the Mongoose model using the schema
export const TermsConditionModel = model<TTermsCondition>('termsCondition', termsConditionSchema);