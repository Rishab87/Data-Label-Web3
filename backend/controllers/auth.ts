import {prisma} from '../config/prismaClient';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {z} from 'zod';
import {Request , Response} from 'express';

dotenv.config();

export const workerSignin = async(req:Request , res:Response)=>{
    try{
        const addressSchema = z.string();
        const hardWalletAddress = addressSchema.parse(req.body.publicKey);
        const existingUser = await prisma.worker.findFirst({
            where:{
                address: hardWalletAddress,
            }
        });

        if(existingUser){
            const secret = process.env.JWT_SECRET;
            let token;
            if(secret !== undefined)
                token = jwt.sign({userId: existingUser.id} , secret);
            res.json({token  , pending_amount: existingUser.pending_amount});
        }
        else{
            const newUser = await prisma.worker.create({
                data:{
                    address: hardWalletAddress,
                    pending_amount: 0,
                    locked_amount: 0,
                }
            });

            const secret = process.env.JWT_SECRET;
            let token;
            if(secret !== undefined)
                token = jwt.sign({userId: newUser.id} , secret);
            res.json({token , pending_amount: newUser.pending_amount});
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
        const addressSchema = z.string();
        const hardWalletAddress = addressSchema.parse(req.body.publicKey);
        const existingUser = await prisma.user.findFirst({
            where:{
                address: hardWalletAddress,
            }
        });

        if(existingUser){
            const secret = process.env.JWT_SECRET;
            let token;
            if(secret !== undefined)
                token = jwt.sign({userId: existingUser.id} , secret);
            res.json({token});
        }
        else{
            const newUser = await prisma.user.create({
                data:{
                    address: hardWalletAddress,
                }
            });
            const secret = process.env.JWT_SECRET;
            let token;
            if(secret !== undefined)
                token = jwt.sign({userId: newUser.id} , secret);
            res.json({token});
        }
        
    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false,
            error: (error as Error).message,
        })
    }
}