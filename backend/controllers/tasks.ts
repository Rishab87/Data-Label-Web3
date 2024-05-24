import {prisma} from '../config/prismaClient';
import {z} from 'zod';
import { uploadImageToCloudinary } from '../utils/imageUploader';
import dotenv from 'dotenv';
dotenv.config();
import {Request , Response} from 'express';

interface RequestWithUser extends Request {
    user?: any;
    files?: any;
}

//we will give 0.1 sol to each reviewer 

export const createTask = async(req:RequestWithUser, res: Response)=>{
    try{
        //zod validation
        const taskSchema = z.object({
            title: z.string().optional(),
            payment: z.string(),
            amount: z.string(),
        });

        const {title , payment  , amount } = taskSchema.parse(req.body);
        
        const images = req.files;
        const imagesArray: string[] = [];
        
        

        if(!images){
            return res.status(400).json({
                message: "Please provide images",
                success: false
            });
        }    

        if(images.length < 2){
            return res.status(400).json({
                message: "Please provide atleast 2 images",
                success: false
            });
        }

        const userId = req.user.userId;

        if(!title || !payment || !images){
            return res.status(400).json({
                message: "Please provide all the details",
                success: false
            });
        }

        //upload image and get url

        for (const key in req.files){
            const image = req.files[key];
            const url = await uploadImageToCloudinary(image, process.env.FOLDER_NAME);
            imagesArray.push(url.secure_url);
        }

        const imageUrls = await Promise.all(imagesArray);

        console.log(imageUrls);
        const task = await prisma.task.create({
            data:{
                title: title !== undefined ? title : "Select the most clickable thumbmnail",
                payment,
                amount: parseInt(amount),
                reviewers: parseInt(amount)/0.1,
                user:{
                    connect: {id: userId}
                },
                options:{
                    create: imageUrls.map((image , index)=>({
                        image_url: image,
                        option_id: index +1,
                }))
                }

            },
            include:{
                options:true
            }
        });

        return res.status(200).json({
            success: true , 
            data: task,
        })
        
    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false,
            error: (error as Error).message,
        });
    }
}

export const getTasks = async(req:RequestWithUser, res: Response)=>{
    try{

        const userId = req.user.userId;

        const tasks = await prisma.task.findMany({
            where:{
                user_id: userId
            },
            include:{
                options:{
                    include:{
                        submissions:true
                    }
                },
                subsmissions:true,
            }
        });

        return res.status(200).json({
            success: true , 
            data: tasks,
        });

    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}

export const finishedTask = async(req:RequestWithUser, res: Response)=>{
    try{

        const userId = req.user.userId;

        const tasks = await prisma.task.findMany({
            where:{
                user_id: userId , 
                reviewers: 0,
            },
            include:{
                options:{
                    include:{
                        submissions:true
                    }
                },
                subsmissions:true,
            }
        });

        return res.status(200).json({
            success: true , 
            data: tasks,
        
        });

    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}

//we don't want same user to review again
export const pendingTask = async(req:RequestWithUser, res: Response)=>{
    try{
        const userId = req.user.userId;
        const tasks = await prisma.task.findMany({
            where:{
                reviewers:{
                    gt: 0
                },
                NOT:{
                    subsmissions:{
                        some:{
                            id: userId
                        }
                    }
                },
            },
            include:{
                options:{
                    include:{
                        submissions:true
                    }
                },
                subsmissions: true,
            },
        });

        return res.status(200).json({
            success: true , 
            data: tasks,
        });

    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}

export const reviewTask = async(req:RequestWithUser, res: Response)=>{
    try{

        const reviewSchema = z.object({
            taskId: z.number(),
            optionId: z.number(),
        });

        const {taskId , optionId} = reviewSchema.parse(req.body);
        const userId = req.user.userId;

        const task =  await prisma.task.update({
            where:{
                id: taskId
            },
            data:{
                reviewers:{
                    decrement:1
                },
                subsmissions:{
                    create:{
                        worker:{
                            connect:{
                                id: userId
                            }
                        },
                        option:{
                            connect:{
                                id: optionId
                            }
                        },
                    }
                }
            },
               
        });

        const updateWorker = await prisma.worker.update({
            where:{
                id: userId
            },
            data:{
                pending_amount:{
                    increment: 0.1
                }
            }
        });

        
        return res.status(200).json({
            success: true , 
            data: task,
        })
    
    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}

//renew task reviewers increase acc to amount paid
export const renewTask = async(req:RequestWithUser, res: Response)=>{
    try{

        const renewSchema = z.object({
            taskId: z.number(),
            amount: z.number(),
        });

        const {taskId , amount} = renewSchema.parse(req.body);

        const task =  await prisma.task.update({
            where:{
                id: taskId
            },
            data:{
                reviewers:{
                    increment: amount/0.1,
                }
            },
               
        });

        return res.status(200).json({
            success: true , 
            data: task,
        })
    
    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}