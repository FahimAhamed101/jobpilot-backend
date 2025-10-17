// notification.interface.ts
import { Types } from 'mongoose';

export type TNotificationType = 
  | 'applied' 
  | 'shortlisted' 
  | 'interview' 
  | 'offer' 
  | 'info' 
  | 'system';

export interface TNotification {
  _id?: Types.ObjectId;
  title: string;
  text: string;
  userId: Types.ObjectId;
  type: TNotificationType;
  read: boolean;
  data?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}