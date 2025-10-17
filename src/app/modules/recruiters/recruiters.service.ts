import { TRecruiter } from "./recruiters.interface";
import { RecruiterModel } from "./recruiters.model";

const createRecruitersFromDB = async (payload : TRecruiter) => {
    const result = await RecruiterModel.create(payload);
    return result;
};

const getAllRecruiters = async () => {
    const result = await RecruiterModel.find({})
    return result;
}
const getSingleRecruiters = async (id : string) => {
    const result = await RecruiterModel.find({_id : id})
    return result;
}

const updateRecruiter = async (id : string, payload : Partial<TRecruiter>) => {
    console.log(payload)
    const result = await RecruiterModel.findByIdAndUpdate(id , payload, {new : true});
    return result;
} 

const deleteRecruiter = async (id : string) => {
    const result = await RecruiterModel.findByIdAndDelete(id);
    return result
}



export const recruitersService = {
    createRecruitersFromDB,
    getAllRecruiters,
    getSingleRecruiters,
    updateRecruiter, 
    deleteRecruiter
} 