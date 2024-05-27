"use client"
import { decrementPendingAmount, failedTask, getPendingTasks  , lockamount} from '@/apis/apiFunctions/task';
import React, { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey , Connection } from '@solana/web3.js';
import { Transaction , SystemProgram } from '@solana/web3.js';
import { Keypair , LAMPORTS_PER_SOL} from '@solana/web3.js';
import { workerSignin } from '@/apis/apiFunctions/auth';
import Image from 'next/image';
import { reviewTask } from '@/apis/apiFunctions/task';
import toast from 'react-hot-toast';
import bs58 from 'bs58';
import dynamic from 'next/dynamic';
const WalletMultiButton = dynamic(
  async () =>
      (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);



const page = () => {

    const [loading , setLoading] = React.useState<boolean>(false);
    const [pendingTasks , setPendingTasks] = React.useState<any[]>([]);
    const [renderSteps , setRenderSteps] = React.useState<number>(0); 
    const [token , setToken] = React.useState<string | null>(null);
    const {publicKey , connected , connecting , signMessage} = useWallet();
    const [pendingAmount , setPendingAmount] = React.useState<string>("0");
    const [locked  , setLocked] = React.useState<boolean>(false);


    useEffect(()=>{
      setLoading(true);
      const fetchPendingTasks = async () => {
        const tasks = await getPendingTasks(token);
        setPendingTasks(tasks);
      }
      if(token)
        fetchPendingTasks();
      setLoading(false);
    } , [token]);

    const signin= async()=>{
            let signature;
            const message = "Please sign to sign in";
            try {
                const encodedMessage = new TextEncoder().encode(message);
                signature = await signMessage!(encodedMessage);
                console.log('Signature:', signature);
    
            
                const workerData = await workerSignin(publicKey?.toBase58() , bs58.encode(signature) , message);

                setToken(workerData.token);
                setLoading(false);
                setPendingAmount(workerData.pending_amount);
                console.log(workerData);
            } catch (err) {
                console.error('Error signing message:', err);
                setLoading(false);  
            }
      }

  //review function , payouts pending

  const submitResponse = async (optionId:number)=>{
    const task = await reviewTask(pendingTasks![renderSteps].id , optionId , token);
    setPendingAmount(JSON.stringify(parseFloat(pendingAmount)+ 0.1));
    setRenderSteps(renderSteps+1);
  }

  const solPayout = async()=>{
    try{

      setLocked(true);
      const toastId = toast.loading('Payout in progress');
      const connection = new Connection('https://api.devnet.solana.com');
      // await lockamount(token , pendingAmount);

      // Retrieve the sender's private key from environment variable
      const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
      if (!privateKey) {
          toast.dismiss(toastId);
          throw new Error('Private key not found in environment variables');
      }
      const privateKeyBytes = bs58.decode(privateKey);
      // Convert private key to a Uint8Array and create Keypair
      const senderKeypair = Keypair.fromSecretKey(privateKeyBytes);
  
      // Create a new transaction
      const transaction = new Transaction().add(
          SystemProgram.transfer({
              fromPubkey: senderKeypair.publicKey,
              toPubkey: publicKey!,
              lamports: parseFloat(pendingAmount) * LAMPORTS_PER_SOL,  
          })
      );
  
      const { blockhash , lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderKeypair.publicKey;
  
      transaction.sign(senderKeypair);
  
      const signature = await connection.sendRawTransaction(transaction.serialize());
      
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

    if (confirmation.value.err) {
        toast.dismiss(toastId);
        toast.error('Transaction ');
      throw new Error('Transaction failed');
    }

      await decrementPendingAmount(parseFloat(pendingAmount) , token);
      toast.success('Payment successful');length
      setPendingAmount("0");
      toast.dismiss(toastId);
      setLocked(false);

    } catch(error){
      toast.error("Failed to payout , try again later or contact the owner!");
      console.error(error);
      // await failedTask(pendingAmount , token);
      setLocked(false);
    }
  }

  if(loading){
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='font-bold'>Loading...</p>
      </div>
    )
  }

  return (
    <div className='overflow-x-hidden flex flex-col gap-6 w-screen h-screen'>
        <div className='flex w-screen justify-between overflow-y-hidden mt-4'>
            <h1 className='font-bold text-2xl ml-auto p-4 w-screen'>Welcome to Labify</h1>
            {
              token && (
                <button className='hover:scale-95 transition-all duration-200 rounded-lg bg-white text-black mr-5 w-[180px] px-2 h-fit py-[0.8rem] font-bold' disabled={locked} onClick={solPayout}>{pendingAmount} Payout</button>
              )
            }
            <div className='hover:scale-95 transition-all duration-200 w-fit h-fit mr-2'>
              { token && 
                <WalletMultiButton style={{color: 'black' , backgroundColor: 'white' }} />

              }
            </div>
            {
                !token && (
                  <button className='hover:scale-95 transition-all duration-200 px-4 py-2 rounded-lg bg-white text-black w-[180px]' onClick={signin}>Connect Wallet</button>
                )
              }
            
        </div>

        {
          !token && 
          (
            <div className='flex justify-center items-center h-[80vh]'>
              <p className='font-bold text-3xl'>Please connect the wallet</p>
            </div>  
          )
        }

        {
          !pendingTasks || renderSteps >= pendingTasks?.length && (
            <div className='flex items-center justify-center h-[80vh]'>
              <p className='font-bold text-3xl'>No tasks available!</p>
            </div>
          )
        }

        {
          pendingTasks?.length >0 && renderSteps < pendingTasks?.length && (
            <div className='flex flex-col items-center w-full gap-7'>
              <h1 className='font-bold text-2xl'>{pendingTasks[renderSteps].title}</h1>
              <div className='flex gap-5 flex-wrap mt-10'>
              {
                pendingTasks[renderSteps].options.map((option:any , index:number)=>(
                  <div key={option.option_id} className='flex flex-col items-center gap-4'>
                    <Image src={option.image_url} alt="option" width={"300"} height={"169"} className='cursor-pointer' onClick={()=> submitResponse(option.id)}/>
                  </div>
                ))
              }
              </div>
              <p className='text-2xl font-bold'>Click on Image To Select</p>
            </div>
          )
        }
        
    </div>
  )
}

export default page