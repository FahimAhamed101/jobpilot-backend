import  { Document } from 'mongoose';

export type TFaq = Document & {
  question: string;
  description: string;
}