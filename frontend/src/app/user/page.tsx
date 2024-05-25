"use client"
import React, { useEffect, useMemo } from 'react'
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet} from '@solana/wallet-adapter-react';
import {userSignin} from '../../apis/apiFunctions/auth';
import { useForm } from "react-hook-form";
import Image from 'next/image';
import { createTask } from '@/apis/apiFunctions/task';
import { PublicKey , Connection } from '@solana/web3.js';
import { Transaction , SystemProgram } from '@solana/web3.js';
import { LAMPORTS_PER_SOL} from '@solana/web3.js';
import toast from 'react-hot-toast';
import { getTasks } from '@/apis/apiFunctions/task';
import { renewTask } from '@/apis/apiFunctions/task';


const page = () => {


    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm();

   
    let payment:string;
    const transferSol = async () => {
        if(!publicKey){
            alert('Please connect wallet');
            return;
        }

        const { blockhash , lastValidBlockHeight } = await connection.getLatestBlockhash();

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey("9A6ZjfpuKVgvySvUyW2T6ofTwQt6iSfto5e4bNiAC23B"),
            lamports: amount !==0?amount: renewAmount * 0.01 * LAMPORTS_PER_SOL, // Convert SOL to lamports
          })
        );

 
        console.log('Sender Public Key:', publicKey);
        console.log('Fee Payer:', transaction.feePayer);
        console.log('Blockhash:', blockhash);

        const signature = await sendTransaction(transaction, connection);

        const confirmation = await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight,
          }, 'confirmed');

          payment = signature;

        if (confirmation.value.err) {
            toast.error('Transaction ');
          throw new Error('Transaction failed');
        }

        toast.success('Payment successful');
   
      };
      
      

    const previewFile = (files:any) => {
        // console.log(file)
        const newImages = [];
          for (let i = 0; i < files.length; i++) {
          const file = files[i];
          newImages.push({
            file,
            preview: URL.createObjectURL(file),
          });
        }    
        setImages([...images , ...newImages]);
    };
    
    
    const [token , setToken] = React.useState<string | null>(null);
    const [images , setImages] = React.useState<any[]>([]);

    const {publicKey , connected , connecting , sendTransaction} = useWallet();
    const connection = new Connection('https://api.devnet.solana.com');
    const [loading , setLoading] = React.useState<boolean>(false);
    const [amount , setAmount] = React.useState<number>(0);
    const [userTasks , setUserTasks] = React.useState<any[]>([]);
    const [votes , setVotes] = React.useState<any>({});
    const [renewAmount , setRenewAmount] = React.useState<number>(0); 

    useEffect(()=>{

        const fetchTasks = async()=>{
            if(token){
                const tasks = await getTasks(token);
                setUserTasks(tasks);
                console.log(tasks);
                let temp:any = {}
                tasks.forEach((task:any)=>{
                    task.subsmissions.forEach((submission:any)=>{
                        temp[submission.option_id] = temp[submission.option_id] ? temp[submission.option_id] + 1 : 1;
                        
                    })
                })     

                setVotes(temp);
                // console.log(votes);
                
            }
        }

        fetchTasks();
    } , [token]);

    useEffect(()=>{
        const signin= async()=>{
            if(connected){
                const token = await userSignin(publicKey?.toBase58());
                setToken(token);
                setLoading(false);
                console.log(token);
            }
            else if(connecting){
                setLoading(true);
            }
        }

        signin();
    } , [connected , connecting]);

    const submitHandler = async(data:any)=>{
        console.log(data);
        if(!connected){
            alert('Please connect wallet');
            setToken(null);
            return;
        }
        if(amount === 0){
            alert('Please select no of reviewers');
            return;
        }
        //add toast here
        if(images.length === 0 || images.length === 1){
            alert('Please select more images');
            return;
        }
        try{
            await transferSol();
        } catch(error){
            console.error(error);
            alert('Airdrop failed');
            return;
        }

        const formData = {
            title: data.title,
            payment,
            amount: amount.toString(),
            taskImage: images
        }
        const task = await createTask(formData , token);
        setUserTasks([...userTasks , task]);
    }

    const renew = async (taskId:number)=>{
        setAmount(0);
        await transferSol();
        if(renewAmount === 0){
            alert('Please select no of reviewers');
            return;
        }

        const task = await renewTask(taskId , renewAmount , token);

    }

  return (
    <div className='flex flex-col items-center gap-20 h-screen w-screen px-2 overflow-x-hidden overflow-y-auto mt-2'>
        <div className='flex w-screen justify-between h-fit'>
            <h1 className='font-bold text-2xl ml-auto p-4 w-screen'>Welcome to Labify</h1>
          
            <div className='hover:scale-95 transition-all duration-200 h-fit w-fit mr-4'>
                <WalletMultiButton style={{color: 'black' , backgroundColor: 'white' }} />
            </div>
            
        </div>
        
        {
            token && (
                <form onSubmit={handleSubmit(submitHandler)} className='flex flex-col font-bold gap-6 items-center justify-center w-[70%]'>

                    <h1 className='text-3xl'>Upload Thumbnails (Recommended 16:9)</h1>
                    <h2 className='text-2xl'>Select No of Reviews</h2>

                    <div className='flex gap-2 font-bold'>
                        <input type="range" step={"10"} max={"1000"} onChange={(e)=> setAmount(parseInt(e.target.value))} defaultValue={0} />
                        <div>{amount/0.1} people can review</div>
                    </div>

                    <div className='flex flex-col gap-5'>
                        <label htmlFor="title">Enter Title: (optional)</label>
                        <input type="text" id='title' className='text-black w-full rounded-md p-2' defaultValue={"Select the most suitable thumbnail:"} {...register("title" , {required: true})}/>
                        <input type="file" onChange={(e)=> previewFile(e.target.files)} accept='image/*' multiple/>

                    </div>
                    
                    
                    <div className='flex gap-2 flex-wrap'>
                        {
                            images.map((image , index)=>(
                            <Image key={index} src={image.preview} alt={`${index+1}`} width={"300"} height={"169"} className=' object-fit 16:9'/>
                            ))
                        }
                    </div>

                    {(images.length >1 &&
                    <button type='submit' className='hover:scale-95 transition-all duration-200 px-4 py-2 rounded-lg bg-white text-black w-[180px]'>Pay {amount} sol & Upload</button>)}
                </form>
            )
        }


        {
            userTasks.length > 0 && (
            <div>
                <h1 className='font-bold text-2xl ml-15'>Pending Tasks:</h1>
                <div className='flex flex-col gap-2 mt-2'>
                {   
                    userTasks.map((task, index)=>(
                        <div className='flex flex-col gap-3 items-center justify-center' key={index}>
                            {
                                task.reviewers  > 0 &&(
                                    <div className='flex flex-col items-center justify-center gap-4'>
                                        <div className='w-[80vw] text-gray-500 h-[2px] bg-gray-500'></div>
                                        <p className='font-bold text-xl'>Title: {task.title}</p>
                                    <div className='flex gap-5 flex-wrap'>
                                    {   
                                        task.options.map((option:any , index:number)=>(
                                            <div key={index} className='flex gap-3'>
                                                <div className='flex flex-col gap-3'>
                                                    <div className='w-[300px] h-[169px]'>
                                                    <Image src={option.image_url} alt='option' width={"300"} height={"169"}/>
                                                    </div>
                                                    <p className=' bg-blue-300 text-white font-bold flex justify-center items-center px-4 py-2 h-fit rounded-lg'>{votes[option.id]? votes[option.id]: 0} submissions</p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    </div>

                                   

                                    </div>

                                    
                                )
                            }
                            
                        </div>
                    ))
                }
                </div>
                
                <h1 className='font-bold text-2xl ml-15'>Finished Tasks:</h1>
                <div className='flex flex-col gap-2 mt-2'>
                {   
                    userTasks.map((task, index)=>(
                        <div className='flex flex-col gap-3 items-center justify-center' key={index}>
                            {
                                task.reviewers  === 0?(
                                    <div className='flex flex-col items-center justify-center gap-4'>
                                        <div className='w-[80vw] text-gray-500 h-[2px] bg-gray-500'></div>
                                        <p className='font-bold text-xl'>Title: {task.title}</p>
                                         <div className='flex gap-2 font-bold'>
                                            <input type="range" step={"10"} max={"1000"} onChange={(e)=> setRenewAmount(parseInt(e.target.value))} defaultValue={0} />
                                            <div>{renewAmount/0.1} people can review</div>
                                        </div>
                                        <button className='bg-white px-4 py-2 text-black rounded-lg font-bold hover:scale-95 transition-all duration-200' onClick={() => renew(task.id)}>Renew Task</button>
                                    <div className='flex gap-5 flex-wrap'>
                                    {   
                                        task.options.map((option:any , index:number)=>(
                                            <div key={index} className='flex gap-3'>
                                                <div className='flex flex-col gap-3'>
                                                    <div className='w-[300px] h-[169px]'>
                                                    <Image src={option.image_url} alt='option' width={"300"} height={"169"}/>
                                                    </div>
                                                    <p className=' bg-blue-300 text-white font-bold flex justify-center items-center px-4 py-2 h-fit rounded-lg'>{votes[option.id]? votes[option.id]: 0} submissions</p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    </div>

                                   

                                    </div>

                                    
                                ): (
                                    <div className='flex items-center justify-center font-bold text-xl'>
                                        <p className='text-white'>No Finished Tasks</p>
                                    </div>
                                )
                            }
                            
                        </div>
                    ))
                }
                </div>



            </div>

            )
        }

        
        
    </div>
  )
}

export default page