import { PublicKey } from "@solana/web3.js";
import { apiConnector } from "../apiConnector";
import { authEndpoints } from "../apiEndpoints";

export const userSignin = async (publicKey: string | undefined) => {
    try{
        // console.log(publicKey);
        
        const response = await apiConnector( "POST" , authEndpoints.userSignin , {publicKey} , {}  , {});

        return response.data.token;

    } catch(e){
        console.error(e);
        
    }
}