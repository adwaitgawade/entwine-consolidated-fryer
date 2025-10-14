import React from 'react'
import Link from 'next/link'

const page = () => {
  return (
    <div className='flex h-screen items-center justify-center flex-col gap-4'>
      <Link className='text-blue-500 hover:text-blue-600' href="/upload">Upload</Link>
      <Link className='text-blue-500 hover:text-blue-600' href="/api/latest/theobroma">Theobroma</Link>
      <Link className='text-blue-500 hover:text-blue-600' href="/api/latest/ashtech">Ashtech</Link>
      <Link className='text-blue-500 hover:text-blue-600' href="/api/latest/teapost">Teapost</Link>
    </div>
  )
}

export default page