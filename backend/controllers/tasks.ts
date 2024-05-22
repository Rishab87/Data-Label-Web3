import {prisma} from '../config/prismaClient';
import {z} from 'zod';

export const createTask = async(req , res)=>{
    try{
        //zod validation
        const taskSchema = z.object({
            title: z.string().optional(),
            payment: z.string(),
            amount: z.string(),
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

        const task = await prisma.task.create({
            data:{
                title: title !== undefined ? title : "Select the most clickable thumbmnail",
                payment,
                amount,
                user:{
                    connect: {id: userId}
                },
                options:{
                    create: images.map((image)=>({
                        image_url: image,
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
                options:true
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