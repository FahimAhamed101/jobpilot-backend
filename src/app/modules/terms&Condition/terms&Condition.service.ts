import { TTermsCondition } from "./terms&Condition.interface";
import { TermsConditionModel } from "./terms&Condition.model";

const createTermsConditionInDB = async (payload: TTermsCondition) => {
    const result = await TermsConditionModel.create(payload);
    return result;
}

const updateTermsConditionFromDB = async (payload: TTermsCondition, id: string) => {
    const result = await TermsConditionModel.findByIdAndUpdate(id, payload, {new: true});
    return result;
} 

const readTermsConditionFromDB = async () => {
    const result = await TermsConditionModel.find({});
    return result;
}

export const termsConditionService = {
    createTermsConditionInDB,
    updateTermsConditionFromDB,
    readTermsConditionFromDB
}