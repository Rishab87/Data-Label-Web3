import {prisma} from '../config/prismaClient';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {z} from 'zod';
import nacl from 'tweetnacl';
import {Request , Response} from 'express';
import { PublicKey  , Keypair} from '@solana/web3.js';
import bs58 from 'bs58';
import { decodeUTF8 } from 'tweetnacl-util';


dotenv.config();


const verifySignature = (
    publicKeyBase58: string,
    message: string,
    signatureBase58: string
): boolean => {
    try {
        const publicKey = new PublicKey(publicKeyBase58).toBytes();
        const messageBytes = decodeUTF8(message);
        const signatureUint8Array = bs58.decode(signatureBase58);
        // console.log(signatureUint8Array);
        return nacl.sign.detached.verify(messageBytes, signatureUint8Array, publicKey);

    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
};

export const workerSignin = async(req:Request , res:Response)=>{
    try{
        const siginSchema = z.object({ 
            publicKey: z.string(),
            signature: z.string(),
            message: z.string(),
        }); 
        const {publicKey , signature , message} = siginSchema.parse(req.body);
        const existingUser = await prisma.worker.findFirst({
            where:{
                address: publicKey,
            }
        });

        if(existingUser){
            const secret = process.env.JWT_SECRET;
            let token;
            if(secret !== undefined)
                token = jwt.sign({userId: existingUser.id} , secret);

            if(verifySignature(publicKey , message , signature))
                res.json({token  , pending_amount: existingUser.pending_amount});
            else{
                res.status(400).json({
                    message: "Invalid Signature",
                    success: false,
                })
            }
        }
        else{
            const newUser = await prisma.worker.create({
                data:{
                    address: publicKey,
                    pending_amount: 0,
                    locked_amount: 0,
                }
            });

            const secret = process.env.JWT_SECRET;
            let token;
            if(secret !== undefined)
                token = jwt.sign({userId: newUser.id} , secret);

            if(verifySignature(publicKey , message , signature)){
            res.json({token , pending_amount: newUser.pending_amount});
            }
            else{
                res.status(400).json({
                    message: "Invalid Signature",
                    success: false,
                })
            
            }
        }
        
    } catch{
        res.status(500).json({
            message: "Something went wrong",
            success: false
        })
    }
}

export const userSignin = async(req:Request , res:Response)=>{
    try{
        console.log(req.body);

        const siginSchema = z.object({ 
            publicKey: z.string(),
            signature: z.string(),
            message: z.string(),
        }); 
        const {publicKey , signature , message} = siginSchema.parse(req.body);
        const existingUser = await prisma.user.findFirst({
            where:{
                address: publicKey,
            }
        });

        if(existingUser){
            const secret = process.env.JWT_SECRET;
            let token;
            if(secret !== undefined)
                token = jwt.sign({userId: existingUser.id} , secret);

            if(verifySignature(publicKey , message , signature)){
                res.json({token});
            }
            else{
                res.status(400).json({
                    message: "Invalid Signature",
                    success: false,
                })
            
            }
        }
        else{
            const newUser = await prisma.user.create({
                data:{
                    address: publicKey,
                }
            });
            const secret = process.env.JWT_SECRET;
            let token;
            if(secret !== undefined)
                token = jwt.sign({userId: newUser.id} , secret);

            if(verifySignature(publicKey , message , signature)){
                res.json({token});
            }
            else{
                res.status(400).json({
                    message: "Invalid Signature",
                    success: false,
                })
            }
        }
        
    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false,
            error: (error as Error).message,
        })
    }
}