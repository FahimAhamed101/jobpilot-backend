import { z } from 'zod';

const recruiterValidationSchema = z.object({
  body : z.object({
    name: z.string().min(1, 'Recruiter name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    companyName: z.string().min(1, 'Company name is required'),
    phoneNumber: z.string().min(10, 'Phone number should be at least 10 characters'),
    linkedin: z.string().url('Invalid LinkedIn URL').min(1, 'LinkedIn URL is required'),
    imageUrl: z.string().url().optional(),  // Optional field for image URL
  })
});

export const recruitersValidation = {
    recruiterValidationSchema
}
