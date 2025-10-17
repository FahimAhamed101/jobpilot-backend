import { Document } from 'mongoose';

// Define TypeScript Interface
export type TRecruiter = Document & {
  name: string;
  jobTitle: string;
  RecID : string;
  companyName: string;
  phoneNumber: string;
  linkedin: string;
  imageUrl?: string;
}

