import mongoose, { Schema } from "mongoose";
import { FileType, TFileUpload } from "./library.interface";


// Mongoose schema definition
const fileUploadSchema = new Schema<TFileUpload>({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],  // Category is just a string now
  },
  fileType: {
    type: String,
    enum: Object.values(FileType), // Restricts the type to "video" or "pdf"
    required: [true, 'File type is required'],
  },
  fileUrl: {
    type: String,
  },
  viewCount: {
    type: Number,
    default : 0,
  },
  videoDuration: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required'],  // URL or path after file upload
  },
});

// Mongoose Model
export const LibraryModel = mongoose.model<TFileUpload>('FileUpload', fileUploadSchema);