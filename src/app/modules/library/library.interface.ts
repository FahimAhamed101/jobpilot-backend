import mongoose, { Schema, Document } from 'mongoose';

// Enum for file types
export enum FileType {
  VIDEO = "video",
  PDF = "pdf",
}

// Interface for the File Upload Mongoose model
export type TFileUpload = Document & {
  title: string;
  description: string;
  category: string;  // Category is a simple string now
  fileType: FileType; // Type of the file (video or pdf)
  fileUrl: string;  // URL or file path of the uploaded file
  viewCount: number;  
  videoDuration: string;  
  thumbnailUrl: string;  // URL or file path of the uploaded file
}
