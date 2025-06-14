'use client';

import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-lg'>
        <h1 className='mb-4 text-center text-2xl font-bold'>
          ThreadJuice Test Page
        </h1>

        <div className='space-y-4 text-center'>
          <p className='text-gray-600'>
            This is a simple test to verify React is working
          </p>

          <div className='rounded bg-blue-50 p-4'>
            <p className='text-lg font-semibold'>Counter: {count}</p>
            <button
              onClick={() => setCount(count + 1)}
              className='mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
            >
              Click me!
            </button>
          </div>

          <div className='mt-6 grid grid-cols-2 gap-4'>
            <div className='rounded bg-green-100 p-3'>
              <span className='font-medium text-green-800'>
                ✅ React Working
              </span>
            </div>
            <div className='rounded bg-blue-100 p-3'>
              <span className='font-medium text-blue-800'>✅ Tailwind CSS</span>
            </div>
          </div>

          <div className='mt-4 text-sm text-gray-500'>
            Server: <strong>localhost:3000/test</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
