import React from 'react'
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import FileUploadForm from './uploadClient';

const page = async () => {

    const s3 = new S3Client({
        region: process.env.AWS_REGION!,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
    })

    const bucket = process.env.AWS_S3_BUCKET!;

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