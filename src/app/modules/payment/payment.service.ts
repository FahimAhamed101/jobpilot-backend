import { User } from "../user/user.model";
import { TPayment } from "./payment.interface";
import { PaymentModel } from "./payment.model";

const createPaymentToDB = async (payload: TPayment, userId: string) => {
    // Check if the userId exists and is a valid user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Set userId in the payload before creating the payment
    const paymentPayload = { ...payload, userId };

    // Create the payment record
    const payment = await PaymentModel.create(paymentPayload);

    // Calculate the subscription end date (30 days from now)
    const subStartDate = Date.now(); // Current time in milliseconds
    const subEndDate = subStartDate + (30 * 24 * 60 * 60 * 1000); // Adding 30 days

    // Update user subscription status and end date
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isSubscription: true, subEndDate }, // Update subscription status and end date
      { new: true } // Return the updated user document
    );

    // Return the created payment 
    return payment;
}


const getAllPaymentFromDB = async () => {
    const result = await PaymentModel.find({}).populate('userId');
    return result;
} 
const getSinglePaymentFromDB = async (id : string) => {
    const result = await PaymentModel.findById(id).populate('userId');
    return result;
} 

const getAllPaymentUnderUserFromDB = async (userId  : string) => {
    const result = await PaymentModel.find({userId : userId}).populate('userId');
    return result
}

export const paymentService = {
    createPaymentToDB,
    getAllPaymentFromDB,
    getSinglePaymentFromDB,
    getAllPaymentUnderUserFromDB
}