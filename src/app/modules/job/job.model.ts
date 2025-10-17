import { Schema, model, Types } from 'mongoose';
import { TJob } from './job.interface';

// Define the schema for JobModel
const jobSchema = new Schema<TJob>({
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
     type: String,
     enum : ["Applied", "Shortlisted", "Rejected", "Interview", "Offer"],
    required: true, 
    default : 'Applied'
  },
  appliedDate: { type: Date, required: true },
  companyLogo : {type : String},
  jdLink: { type: String, required: true },
});

// speeds up match + group by
jobSchema.index({ userId: 1, status: 1 });
// Create the JobModel
export const JobModel = model<TJob>('Job', jobSchema);


