import { z } from 'zod';

// Zod validation schema for 
 const paymentValidationSchema = z.object({
  body : z.object({
    amount: z.number().positive(), // Ensure the amount is a positive number
  transactionId: z.string().min(1), // Ensure the transactionId is a non-empty string
  })
});

export const paymentValidation = {
    paymentValidationSchema
}

