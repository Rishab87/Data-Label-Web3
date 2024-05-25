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
        console.log(response.data.data);
        toast.dismiss(toastId);
        
        return response.data.data
        
    } catch(error){
        console.log(error);
    }
    toast.dismiss(toastId);
}

export const getPendingTasks = async (token: string | null) => {
    const toastId = toast.loading("Fetching tasks");
    try{
        const response = await apiConnector("GET" , taskEndpoints.getPendingTasks , {} , {"Authorization": `Bearer ${token}`}, {});

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        console.log(response.data.data);
        toast.success("Tasks fetched successfully");
        toast.dismiss(toastId);
        return response.data.data;

    } catch(error){
        console.log(error);
        toast.error("Failed to fetch tasks");
    }
    toast.dismiss(toastId);
}

export const reviewTask = async (taskId: number , optionId: number , token: string | null) => {
    const toastId = toast.loading("Reviewing task");
    try{

        const response = await apiConnector("POST" , taskEndpoints.reviewTask , {taskId , optionId} , {"Authorization": `Bearer ${token}`}, {});

        if(!response.data.success){
            throw new Error(response.data.message);
        }
        toast.dismiss(toastId);
        toast.success("Task reviewed successfully");
        return response.data.data;

    } catch(error){
        console.log(error);
        toast.error("Failed to review task");
    }
    toast.dismiss(toastId);
}

export const decrementPendingAmount = async (amount: number , token: string | null) => {
    const toastId = toast.loading("Decrementing pending amount");
    try{

        const response = await apiConnector("POST" , taskEndpoints.decPendingAmount , {amount} , {"Authorization": `Bearer ${token}`}, {});

        if(!response.data.success){
            throw new Error(response.data.message);
        }
        toast.dismiss(toastId);
        toast.success("Pending amount decremented successfully");
        return response.data.data;

    } catch(error){
        console.log(error);
        toast.error("Failed to decrement pending amount");
    }
    toast.dismiss(toastId);
}

export const lockamount = async (token: string | null , amount: number) => {
    const toastId = toast.loading("Locking amount");
    try{

        const response = await apiConnector("POST" , taskEndpoints.lockAmount , {amount} , {"Authorization": `Bearer ${token}`}, {});

        if(!response.data.success){
            throw new Error(response.data.message);
        }
        toast.dismiss(toastId);
        toast.success("Amount locked successfully");
        return response.data.data;

    } catch(error){
        console.log(error);
        toast.error("Failed to lock amount");
    }
    toast.dismiss(toastId);
}

export const failedTask = async (amount: number , token: string | null) => {
    const toastId = toast.loading("Marking task as failed");
    try{

        const response = await apiConnector("POST" , taskEndpoints.failedTask , {amount} , {"Authorization": `Bearer ${token}`}, {});

        if(!response.data.success){
            throw new Error(response.data.message);
        }
        toast.dismiss(toastId);
        return response.data.data;

    } catch(error){
        console.log(error);
        toast.error("Failed to unlock amount");
    }
    toast.dismiss(toastId);

}

export const getTasks = async (token: string | null) => {
    try{

        const response = await apiConnector("GET" , taskEndpoints.getTasks , {} , {"Authorization": `Bearer ${token}`}, {});

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        return response.data.data;

    } catch(error){
        console.log(error);

    }
}

export const renewTask = async (taskId: number  , amount: number, token: string | null) => {
    const toastId = toast.loading("Renewing task");
    try{

        const response = await apiConnector("POST" , taskEndpoints.renewTask , {taskId , amount} , {"Authorization": `Bearer ${token}`}, {});

        if(!response.data.success){
            throw new Error(response.data.message);
        }
        toast.dismiss(toastId);
        toast.success("Task renewed successfully");
        return response.data.data;

    } catch(error){
        console.log(error);
        toast.error("Failed to renew task");
    }
}