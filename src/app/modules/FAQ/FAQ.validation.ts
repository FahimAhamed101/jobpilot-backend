import { z } from 'zod';

export const faqValidationSchema = z.object({
  body : z.object({
    question: z.string().min(5, 'Question must be at least 5 characters long').max(200, 'Question cannot exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters long').max(1000, 'Description cannot exceed 1000 characters'),
  })
});
