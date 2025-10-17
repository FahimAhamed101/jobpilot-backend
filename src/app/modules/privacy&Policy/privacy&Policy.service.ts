// privacy&Policy.service.ts
import { TPrivacyPolicy } from "./privacy&Policy.interface";
import { PrivacyPolicyModel } from "./privacy&Policy.model";

const createPrivacyPolicyInDB = async (payload: TPrivacyPolicy) => {
    // Validate payload
    if (!payload.text || payload.text.trim() === '') {
        throw new Error('Privacy policy text is required');
    }

    // Delete any existing privacy policy first to ensure only one exists
    await PrivacyPolicyModel.deleteMany({});
    
    const result = await PrivacyPolicyModel.create(payload);
    return result;
}

const updatePrivacyPolicyFromDB = async (payload: TPrivacyPolicy, id: string) => {
    // Validate payload
    if (!payload.text || payload.text.trim() === '') {
        throw new Error('Privacy policy text is required for update');
    }

    if (!id) {
        throw new Error('Privacy policy ID is required');
    }

    const result = await PrivacyPolicyModel.findByIdAndUpdate(
        id, 
        { text: payload.text }, 
        { new: true, runValidators: true }
    );
    
    if (!result) {
        throw new Error('Privacy policy not found with ID: ' + id);
    }
    
    return result;
} 

const readPrivacyPolicyFromDB = async () => {
    const result = await PrivacyPolicyModel.findOne({}); // Use findOne instead of find
    return result;
}

export const privacyPolicyService = {
    createPrivacyPolicyInDB,
    updatePrivacyPolicyFromDB,
    readPrivacyPolicyFromDB
}