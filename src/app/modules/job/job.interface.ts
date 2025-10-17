import {Types } from 'mongoose';

// Define the JobModel interface
export type TJob = {
  companyName: string;
  jobTitle: string;
  userId: Types.ObjectId; 
  adminId: Types.ObjectId;
  status: string;
  companyLogo : string;
  appliedDate: Date;
  jdLink: string;
}