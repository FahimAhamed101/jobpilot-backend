import { z } from 'zod';

// Define Zod validation schema
export const jobValidationSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    userId: z.string().min(1, 'User name is required'),
    adminId: z.string().min(1, 'Admin ID is required'),
    status: z.enum(['Applied', 'Interviewing', 'Offer', 'Rejected']).refine(
      (val) => ['Applied', 'Interviewing', 'Offer', 'Rejected'].includes(val),
      {
        message: 'Invalid status', // Custom error message
      }
    ),
    appliedDate: z.date(),
    jdLink: z.string().url('Invalid job description link'),
  }),
});

export type JobValidation = z.infer<typeof jobValidationSchema>;
