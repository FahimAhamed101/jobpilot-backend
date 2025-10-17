import { z } from 'zod';

// Zod schema for validating PrivacyPolicy
export const privacyPolicyValidationSchema = z.object({
  body : z.object({
    text: z.string().min(1, "Text cannot be empty"), // Ensuring text is not empty
  })
});
