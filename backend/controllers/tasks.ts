import {prisma} from '../config/prismaClient';
import {z} from 'zod';
import { uploadImageToCloudinary } from '../utils/imageUploader';
import dotenv from 'dotenv';
dotenv.config();

//we will give 0.1 sol to each reviewer 

export const createTask = async(req , res)=>{
    try{
        //zod validation
        const taskSchema = z.object({
            title: z.string().optional(),
            payment: z.string(),
            amount: z.number(),
        });

        const imagesSchema = z.array(z.string());

        const {title , payment  , amount } = taskSchema.parse(req.body);
        const images = imagesSchema.parse(req.files.taskImage);

        const userId = req.user.id;

        if(!title || !payment || !images){
            return res.status(400).json({
                message: "Please provide all the details",
                success: false
            });
        }

        //upload image and get url
        const imagePromises = images.map(async(image)=>{
            const url = await uploadImageToCloudinary(image , process.env.FOLDER_NAME);
            return url.secure_url;
        })

        const imageUrls = await Promise.all(imagePromises);

        const task = await prisma.task.create({
            data:{
                title: title !== undefined ? title : "Select the most clickable thumbmnail",
                payment,
                amount,
                reviewers: amount/0.1,
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
            success: false
        });
    }
}

export const getTasks = async(req , res)=>{
    try{

        const userId = req.user.id;

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

export const finishedTask = async(req , res)=>{
    try{

        const userId = req.user.id;

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
export const pendingTask = async(req , res)=>{
    try{
        const userId = req.user.id;
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

export const reviewTask = async(req , res)=>{
    try{

        const reviewSchema = z.object({
            taskId: z.number(),
            optionId: z.number(),
        });

        const {taskId , optionId} = reviewSchema.parse(req.body);
        const userId = req.user.id;

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
export const renewTask = async(req , res)=>{
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