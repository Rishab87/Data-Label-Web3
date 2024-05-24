import React from 'react'
import Link from 'next/link';

const Signin = () => {
  return (
    <div className='flex items-center justify-center h-screen gap-5'>
        <Link href={'/worker'}>
          <button className="bg-white text-black px-4 py-2 rounded-lg hover:scale-90 transition-all duration-200 font-bold">Reviewer</button>
        </Link>
        <Link href={"/user"}>
          <button className="bg-white text-black px-4 py-2 rounded-lg hover:scale-90 transition-all duration-200 font-bold">Upload Thumbnails</button>
        </Link>
        
    </div>
  )
}

export default Signin;