import {prisma} from '../config/prismaClient';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

export const workerSignin = async(req , res)=>{
    try{
        const addressSchema = z.string();
        const hardWalletAddress = addressSchema.parse("9A6ZjfpuKVgvySvUyW2T6ofTwQt6iSfto5e4bNiAC23B");
        const existingUser = await prisma.worker.findFirst({
            where:{
                address: hardWalletAddress,
            }
        });

        if(existingUser){
            const token = jwt.sign({userId: existingUser.id} , process.env.JWT_SECRET);
            res.json({token});
        }
        else{
            const newUser = await prisma.worker.create({
                data:{
                    address: hardWalletAddress,
                    pending_amount: "0",
                    locked_amount: "0",
                }
            });
            const token = jwt.sign({userId: newUser.id} , process.env.JWT_SECRET);
            req.json({token});
        }
        
    } catch{
        res.status(500).json({
            message: "Something went wrong",
            success: false
        })
    }
}

export const userSignin = async(req , res)=>{
    try{
        const addressSchema = z.string();
        const hardWalletAddress = addressSchema.parse("9A6ZjfpuKVgvySvUyW2T6ofTwQt6iSfto5e4bNiAC23B");
        const existingUser = await prisma.user.findFirst({
            where:{
                address: hardWalletAddress,
            }
        });

        if(existingUser){
            const token = jwt.sign({userId: existingUser.id} , process.env.JWT_SECRET);
            res.json({token});
        }
        else{
            const newUser = await prisma.user.create({
                data:{
                    address: hardWalletAddress,
                }
            });
            const token = jwt.sign({userId: newUser.id} , process.env.JWT_SECRET);
            req.json({token});
        }
        
    } catch{
        res.status(500).json({
            message: "Something went wrong",
            success: false
        })
    }
}