"use client"
import React, { useEffect, useState } from 'react'

const NUM_PARTICLES = 12;

const Loading = () => {
  const [particles, setParticles] = useState<
    { left: string; top: string; animationDelay: string; animationDuration: string }[]
  >([]);

  useEffect(() => {
    // Only runs on client
    const generated = Array.from({ length: NUM_PARTICLES }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 2}s`
    }));
    setParticles(generated);
  }, []);

  return (
    <div className='fixed inset-0 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      {/* Animated background particles */}
      <div className='absolute inset-0 overflow-hidden'>
        {particles.map((p, i) => (
          <div
            key={i}
            className='absolute w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse'
            style={p}
          />
        ))}
      </div>

      <div className='relative z-10 flex flex-col items-center space-y-8'>
        {/* Chat-themed main animation */}
        <div className='relative'>
          {/* Central chat bubble */}
          <div className='w-20 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl rounded-br-md relative animate-pulse'>
            <div className='absolute -bottom-2 right-4 w-4 h-4 bg-blue-500 transform rotate-45'></div>
            {/* Typing dots inside chat bubble */}
            <div className='flex items-center justify-center h-full space-x-1'>
              <div className='w-2 h-2 bg-white rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
              <div className='w-2 h-2 bg-white rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></div>
              <div className='w-2 h-2 bg-white rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          {/* Floating message bubbles */}
          <div className='absolute -top-8 -left-12 w-12 h-8 bg-gray-600 rounded-2xl rounded-bl-md animate-bounce' style={{ animationDelay: '0.5s' }}>
            <div className='absolute -bottom-2 left-4 w-4 h-4 bg-gray-600 transform rotate-45'></div>
          </div>
          
          <div className='absolute -bottom-8 -right-12 w-10 h-6 bg-green-500 rounded-2xl rounded-br-md animate-bounce' style={{ animationDelay: '1s' }}>
            <div className='absolute -bottom-2 right-4 w-4 h-4 bg-green-500 transform rotate-45'></div>
          </div>
          
          <div className='absolute top-4 -right-16 w-8 h-6 bg-purple-500 rounded-2xl rounded-br-md animate-bounce' style={{ animationDelay: '1.5s' }}>
            <div className='absolute -bottom-2 right-4 w-4 h-4 bg-purple-500 transform rotate-45'></div>
          </div>
        </div>

        {/* Loading text with chat theme */}
        <div className='text-center'>
          <h3 className='text-2xl font-bold text-gray-200 mb-2 tracking-wider'>
            <span className='inline-block animate-bounce' style={{ animationDelay: '0ms' }}>C</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '100ms' }}>O</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '200ms' }}>N</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '300ms' }}>N</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '400ms' }}>E</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '500ms' }}>C</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '600ms' }}>T</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '700ms' }}>I</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '800ms' }}>N</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '900ms' }}>G</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '1000ms' }}>.</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '1100ms' }}>.</span>
            <span className='inline-block animate-bounce' style={{ animationDelay: '1200ms' }}>.</span>
          </h3>
          
          <p className='text-gray-400 text-sm mb-4'>Preparing your chat experience</p>
          
          {/* Animated progress bar */}
          <div className='w-64 h-2 bg-gray-700 rounded-full overflow-hidden'>
            <div className='h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full animate-pulse' style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Connection status indicators */}
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 bg-green-400 rounded-full animate-pulse'></div>
            <span className='text-gray-300 text-sm'>Server</span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 bg-blue-400 rounded-full animate-pulse' style={{ animationDelay: '0.5s' }}></div>
            <span className='text-gray-300 text-sm'>Messages</span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 bg-purple-400 rounded-full animate-pulse' style={{ animationDelay: '1s' }}></div>
            <span className='text-gray-300 text-sm'>Users</span>
          </div>
        </div>

        {/* Rotating connection rings */}
        <div className='absolute -inset-4 border-2 border-transparent border-t-blue-400 border-r-blue-500 rounded-full animate-spin opacity-30'></div>
        <div className='absolute -inset-8 border-2 border-transparent border-t-green-400 border-r-green-500 rounded-full animate-spin opacity-20' style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
      </div>
    </div>
  )
}

export default Loading
