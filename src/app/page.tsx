import React from 'react'
import Link from 'next/link'
import { getOrganizations } from '@/lib/aws'

const page = async () => {
  const organizations = await getOrganizations()
  return (
    <div className='flex h-screen items-center justify-center flex-col gap-4'>
      <Link className='text-blue-500 hover:text-blue-600' href="/upload">Upload</Link>
      {organizations.map((org) => (
        <Link key={org} className='text-blue-500 hover:text-blue-600' href={`/api/latest/${org}`}>{org?.toUpperCase()}</Link>
      ))}
    </div>
  )
}

export default page