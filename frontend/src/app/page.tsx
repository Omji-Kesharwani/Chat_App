"use client"
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Home = () => {
  const router = useRouter()
  
  useEffect(() => {
    router.push("/chat")
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Redirecting to chat...</div>
    </div>
  )
}

export default Home
