import { Schema, model, Document } from 'mongoose';
import { TRecruiter } from './recruiters.interface';

// Define Mongoose Schema for Recruiter
const recruiterSchema = new Schema({
  name: { type: String, required: true },
  RecID : {type : String, required : true},
  jobTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  linkedin: { type: String, required: true },
  imageUrl: { type: String, required: false },
  email: { type: String, required: false },
}, { timestamps: true });

// Create Mongoose Model
export const RecruiterModel = model<TRecruiter>('Recruiter', recruiterSchema);