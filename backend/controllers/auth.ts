import {prisma} from '../config/prismaClient';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const signin = async(req , res)=>{
    try{
        const hardWalletAddress = "9A6ZjfpuKVgvySvUyW2T6ofTwQt6iSfto5e4bNiAC23B"

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