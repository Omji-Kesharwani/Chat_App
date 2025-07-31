"use client"
import React, { useState } from 'react'
import {ArrowRight, Loader2, Mail} from "lucide-react"
import { redirect, useRouter } from 'next/navigation';
import axios from "axios"
import { useAppData, user_service } from '@/context/AppContext';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';
const LoginPage = () => {

  const [email,setEmail]=useState<string>("");
  const [loading,setLoading]=useState<boolean>(false);
  const {isAuth ,loading:userLoading} =useAppData();
  const router=useRouter();

  const handleSubmit = async(e:React.FormEvent<HTMLElement>):Promise<void>=>{
    e.preventDefault();
    setLoading(true);
    try{
      const res = await axios.post(`${user_service}/api/v1/login`, { email });
      // Handle both 'message' and possible typo 'messsage'
      const msg = res.data.message || res.data.messsage || 'OTP sent to your mail';
      toast.success(msg);
      router.push(`/verify?email=${email}`)
    }
    catch(err:any)
    {
      const msg = err?.response?.data?.message || err?.response?.data?.messsage || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if(userLoading)
  {
    return <Loading/>
  }
  if(isAuth) redirect('/chat');
  return (
    <div className='min-h-screen bg-gray-900  flex items-center justify-center p-4 '>
      <div className='max-w-md w-full'>
      <div className='bg-gray-800 border-gray-700 rounded-lg p-8'>
        <div className='text-center mb-8'>
          <div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex justify-center items-center mb-6'>
            <Mail size={40} className='text-white' />
          </div>
          <h1 className='text-4xl font-bold text-white mb-3'>
            Welcome To ChatApp
          </h1>
          <p className='text-gray-300 text-lg '>Enter your email to continue your journey</p>
        </div>
        <form className='space-y-6'
        onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className='block text-sm font-medium text-gray-300 mb-2'>Email Address</label>
            <input type="email" id="email"  
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className='w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400'
            placeholder='Enter your email address'
            required/>
          </div>
          <button type="submit" className='w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed '
          disabled={loading}>
            {
              loading ?(<div className='flex items-center justify-center gap-2'>
                <Loader2 className="w-5 h-5"/>
                Sending Otp to your mail...
              </div>):(
                <div className='flex items-center justify-center gap-2'>
              <span> Send Verification Code</span>
               <ArrowRight className="w-5 h-5"/>
            </div>
              )
            }
            
           
           
          </button>
        </form>
      </div>
      </div>
      
    </div>
  )
}

export default LoginPage
