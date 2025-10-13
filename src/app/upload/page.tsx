import React from 'react'
import { bucket, s3 } from '@/lib/aws';
import FileUploadForm from './uploadClient';
import { ListObjectsV2Command } from '@aws-sdk/client-s3'

const page = async () => {

    const command = new ListObjectsV2Command({
        Bucket: bucket,
        Delimiter: "/",
    })

    const data = await s3.send(command);

    const folders = data.CommonPrefixes?.map(prefix => prefix.Prefix) || []

    return (
        <div>
            <FileUploadForm folders={folders} />
        </div>
    )
}

export default page