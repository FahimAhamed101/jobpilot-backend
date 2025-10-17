import { Types,  Document } from 'mongoose';

export type TPayment = Document & {
  amount: number;
  transactionId: string;
  userId: Types.ObjectId; // Reference to User model
}