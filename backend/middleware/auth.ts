import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
import { Request , Response  , NextFunction} from 'express';

interface RequestWithUser extends Request {
    user?: any;
}

export const auth = async (req:RequestWithUser, res: Response, next: NextFunction) => {
    try{
        const tokenSchema = z.string();
        const token = tokenSchema.parse(req.header("Authorization")!.replace("Bearer " , ""));
        console.log(token);
        

        const secret = process.env.JWT_SECRET;
        
        try{
            let decoded = {};
            if(secret !== undefined){
                decoded = jwt.verify(token , secret);
            }
            req.user = decoded;
        } catch(error){
            res.status(401).json({
                message: "Unauthorized",
                success: false
            });
        
        }

        next();

    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}