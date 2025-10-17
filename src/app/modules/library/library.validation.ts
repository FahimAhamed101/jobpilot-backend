import { z } from "zod";

// Enum for file types
enum FileType {
  VIDEO = "video",
  PDF = "pdf",
}

// Zod Validation Schema
const fileUploadSchema = z.object({
  body : z.object({
    title: z.string().min(1, "Title is required"), // Ensure a title is provided
  description: z.string().min(1, "Description is required"), // Ensure description is provided
  category: z.string().min(1, "Category is required"), // Ensure category is provided
  fileType: z.enum([FileType.VIDEO, FileType.PDF], { message: "File type must be 'video' or 'pdf'" }), // Enforce video or pdf
  fileUrl: z.string().url("Invalid file URL format"), // Ensure fileUrl is a valid URL
  thumbnailUrl: z.string().url("Invalid file URL format"), // Ensure thumbnailUrl is a valid URL
  })
});

export const libraryValidation = {
    fileUploadSchema
} 

