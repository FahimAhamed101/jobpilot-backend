import mongoose, { Schema, model, Document, Types } from 'mongoose';
import { TPayment } from './payment.interface';
const paymentSchema = new Schema<TPayment>({
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true, unique: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export const PaymentModel = model<TPayment>('Payment', paymentSchema);
