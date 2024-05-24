import toast from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { taskEndpoints } from "../apiEndpoints";

export const createTask = async (formData: object , token: string | null) => {
    const toastId = toast.loading("Creating task");
    try{
        //add loading toast
        console.log(formData);
        
        const response = await apiConnector("POST" , taskEndpoints.createTask  , formData  , {"Authorization": `Bearer ${token}`  ,  "Content-Type": "multipart/form-data"}, {});
        if(!response.data.success){
            throw new Error(response.data.message);
        }

        console.log("Task created successfully");
        toast.success("Task created successfully");
        
    } catch(error){
        console.log(error);
    }
    toast.dismiss(toastId);
}