import React from 'react'
import FileUploadForm from './uploadClient';
import { getOrganizations } from '@/lib/aws';

export const revalidate = 0

const page = async () => {

    const organizations = await getOrganizations()

    return (
        <div>
            <FileUploadForm folders={organizations} />
        </div>
    )
}

export default page