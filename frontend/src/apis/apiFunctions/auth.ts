import { PublicKey } from "@solana/web3.js";
import { apiConnector } from "../apiConnector";
import { authEndpoints } from "../apiEndpoints";
import toast from "react-hot-toast";

export const userSignin = async (publicKey: string | undefined , signature:string | undefined , message: string) => {
    const toastID = toast.loading("Signing in");
    try{
        // console.log(publicKey);
        
        const response = await apiConnector( "POST" , authEndpoints.userSignin , {publicKey , signature , message} , {}  , {});
        toast.success("Signed in successfully");
        toast.dismiss(toastID);
        return response.data.token;

    } catch(e){
        toast.error("Failed to sign in")
        console.error(e);
        
    }
    toast.dismiss(toastID);
}

export const workerSignin = async (publicKey: string | undefined , signature: string | undefined  , message: string) => {
    const toastID = toast.loading("Signing in");
    try{
        // console.log(publicKey);
        const response = await apiConnector( "POST" , authEndpoints.workerSignin , {publicKey  ,signature , message} , {}  , {});

        toast.success("Signed in successfully");
        toast.dismiss(toastID);
        return response.data;
    

    } catch(e){
        console.error(e);
        toast.error("Failed to sign in")
        
    }

    toast.dismiss(toastID);
}