"use client"
import React, { useEffect } from 'react'
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet} from '@solana/wallet-adapter-react';
import {userSignin} from '../../apis/apiFunctions/auth';
import { useForm } from "react-hook-form";
import Image from 'next/image';
import { createTask } from '@/apis/apiFunctions/task';
import { PublicKey , Connection } from '@solana/web3.js';
import { Transaction , SystemProgram } from '@solana/web3.js';
import { Keypair , LAMPORTS_PER_SOL} from '@solana/web3.js';
import toast from 'react-hot-toast';

const page = () => {


    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm();

   
    let payment:string;
    const transferSol = async () => {
        const toasId = toast.loading('Processing payment');
        if(!publicKey){
            alert('Please connect wallet');
            return;
        }

        const { blockhash , lastValidBlockHeight } = await connection.getLatestBlockhash();

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey("9A6ZjfpuKVgvySvUyW2T6ofTwQt6iSfto5e4bNiAC23B"),
            lamports: amount * 0.01 * LAMPORTS_PER_SOL, // Convert SOL to lamports
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
            toast.dismiss(toasId);
            toast.error('Transaction ');
          throw new Error('Transaction failed');
        }

        toast.success('Payment successful');
        toast.dismiss(toasId);
   
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
    const [pendingTasks , setPendingTasks] = React.useState<any>(0);
    const [finishedTasks , setFinishedTasks] = React.useState<any>(0);  

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
            alert('Please select amount');
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
        await createTask(formData , token);
    }

  return (
    <div className='flex flex-col items-center gap-20 h-[80vh] px-2'>
        <div className='flex w-screen justify-between h-fit'>
            <h1 className='font-bold text-2xl ml-auto p-4 w-screen'>Welcome to Labify</h1>
          
            <div className='hover:scale-95 transition-all duration-200 h-fit w-fit'>
                <WalletMultiButton style={{color: 'black' , backgroundColor: 'white' }} />
            </div>
            
        </div>
        
        {
            token && (
                <form onSubmit={handleSubmit(submitHandler)} className='flex flex-col font-bold gap-6 items-center justify-center w-[70%]'>

                    <h1>Upload Thumbnails (Recommended 16:9)</h1>
                    <h2>Select Amount</h2>

                    <div className='flex flex-col'>
                        <label htmlFor="title">Enter Title: (optional)</label>
                        <input type="text" id='title' className='text-black w-full' defaultValue={"Select the most suitable thumbnail:"} {...register("title" , {required: true})}/>
                    </div>
                    
                    <div className='flex gap-2 font-bold'>
                        <input type="range" step={"10"} max={"1000"} onChange={(e)=> setAmount(parseInt(e.target.value))} defaultValue={0} />
                        <div>{amount/0.1} people can review</div>
                    </div>

                    
                    <div className='flex gap-2 flex-wrap'>
                        {
                            images.map((image , index)=>(
                            <Image key={index} src={image.preview} alt={`${index+1}`} width={"300"} height={"169"} className=' object-fit 16:9'/>
                            ))
                        }
                    </div>
                    
                    <input type="file" onChange={(e)=> previewFile(e.target.files)} accept='image/*' multiple />
                    {(images.length >1 &&
                    <button type='submit' className='hover:scale-95 transition-all duration-200 px-4 py-2 rounded-lg bg-white text-black w-[180px]'>Pay {amount} sol & Upload</button>)}
                </form>
            )
        }
        
    </div>
  )
}

export default page