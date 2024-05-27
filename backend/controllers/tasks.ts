import {prisma} from '../config/prismaClient';
import {z} from 'zod';
import { uploadImageToCloudinary } from '../utils/imageUploader';
import dotenv from 'dotenv';
dotenv.config();
import {Request , Response} from 'express';
import { PublicKey , Connection ,clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { parse } from 'path';

const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');
const PARENT_WALLET_ADDRESS = "9A6ZjfpuKVgvySvUyW2T6ofTwQt6iSfto5e4bNiAC23B";   


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
        console.log(payment);
        
        const userId = req.user.userId;
        const user = await prisma.user.findFirst({
            where:{
                id: userId
            }
        });

        if(!user){
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        const transaction = await connection.getTransaction(payment, {
            maxSupportedTransactionVersion: 1
        });

        console.log(transaction)
        console.log(transaction?.meta?.postBalances[1]! - transaction?.meta?.preBalances[1]! , parseFloat(amount)*LAMPORTS_PER_SOL);
        console.log(parseFloat(amount)*100);
        
        if ((transaction?.meta?.postBalances[1]! - transaction?.meta?.preBalances[1]!) !== (parseFloat(amount)*LAMPORTS_PER_SOL)) {
            return res.status(411).json({
                message: "Transaction signature/amount incorrect"
            })
        }

        if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS) {
            return res.status(411).json({
                message: "Transaction sent to wrong address"
            })
        }
    
        if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address) {
            return res.status(411).json({
                message: "Transaction sent to wrong address"
            })
        }
        
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

        if(!task){
            return res.status(400).json({
                success: false,
                message: "Task not created"
            });
        }

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

        if(!tasks){
            return res.status(400).json({
                success: false,
                message: "No tasks found"
            });
        }

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

        if(!tasks){
            return res.status(400).json({
                success: false,
                message: "No tasks found"
            });
        }

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
                subsmissions:{
                    none:{
                        worker_id: userId,
                    },
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

        if(!tasks){
            return res.status(400).json({
                success: false,
                message: "No tasks found"
            });
        }

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

        if(!task){
            return res.status(400).json({
                success: false,
                message: "Task not found"
            });
        }

        if(!updateWorker){
            return res.status(400).json({
                success: false,
                message: "Worker not found"
            });
        }

        
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

export const decrementPendingAmount = async(req: RequestWithUser , res: Response)=>{
    try{
        const userId = req.user.userId;
        
        const {amount} = req.body;

        if(!amount){
            return res.status(400).json({
                success: false,
                message: "Please provide amount"
            });
        }

        const worker = await prisma.worker.update({
            where:{
                id: userId
            },
            data:{
                pending_amount:{
                    decrement: amount
                },
                locked_amount: 0 ,
            }
        });

        if(!worker){
            return res.status(400).json({
                success: false,
                message: "Worker not found"
            });
        }

        return res.status(200).json({
            success: true , 
            data: worker,
        })

    } catch{
        return res.status(500).json({
            message: "Something went wrong",
            success: false
        })
    }
}

export const lockamount = async(req: RequestWithUser , res: Response)=>{
    try{
        const userId = req.user.userId;
        const {amount} = req.body;
        
        const worker = await prisma.worker.update({
            where:{
                id: userId
            },
            data:{
                pending_amount: 0,
                locked_amount: amount,
            }
        });

        if(!worker){
            return res.status(400).json({
                success: false,
                message: "Worker not found"
            });
        }

        return res.status(200).json({
            success: true , 
            data: worker,
        })

    } catch(error){
        return res.status(500).json({
            message: "Something went wrong",
            success: false,
            error: (error as Error).message,
        })
    }

}

export const failedTransaction = async(req: RequestWithUser , res: Response)=>{
    try{
        const userId = req.user.userId;
        const {amount} = req.body;
        
        const worker = await prisma.worker.update({
            where:{
                id: userId
            },
            data:{
                pending_amount: amount,
                locked_amount: 0,
            }
        });

        if(!worker){
            return res.status(400).json({
                success: false,
                message: "Worker not found"
            });
        }

        return res.status(200).json({
            success: true , 
            data: worker,
        })

    } catch{
        return res.status(500).json({
            message: "Something went wrong",
            success: false
        })
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

        if(!task){
            return res.status(400).json({
                success: false,
                message: "Task not found"
            });
        }

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