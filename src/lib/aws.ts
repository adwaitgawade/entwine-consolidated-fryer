"use server"

import semver from "semver";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.AWS_S3_BUCKET!;
const endpoint = process.env.CLOUDFLARE_S3_API!;

const s3 = new S3Client({
    endpoint,
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
})

export const getOrganizations = async () => {
    const command = new ListObjectsV2Command({
        Bucket: bucket,
        Delimiter: "/",
    })
    const data = await s3.send(command);
    const organizations = data.CommonPrefixes?.map(prefix => prefix.Prefix?.split("/")[0]) || []
    return organizations
}

export const getVersions = async (organization: string) => {
    const prefix = organization.endsWith("/") ? organization : `${organization}/`;
    const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
    })

    const data = await s3.send(command);

    const versions = data.Contents?.
        filter((obj) => obj.Key?.endsWith(".ino.bin")).
        map((obj) => ({
            key: obj.Key!,
            version: obj.Key!.split("/").pop()!.split(".ino.bin")[0],
            url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`,
        })).
        filter((obj) => semver.valid(obj.version) !== null) || [];

    return versions
}

export const getJsonVersions = async (organization: string) => {
    const prefix = organization.endsWith("/") ? organization : `${organization}/`;
    const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
    })

    const data = await s3.send(command);

    const versions = data.Contents?.
        filter((obj) => obj.Key?.endsWith(".json")).
        map((obj) => ({
            key: obj.Key!,
            version: obj.Key!.split("/").pop()!.split(".json")[0],
            url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`,
        })).
        filter((obj) => semver.valid(obj.version) !== null) || [];

    return versions
}

export const getObjectUrl = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
        ResponseContentType: 'application/json'
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

    const cmd = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    })

    const response = await s3.send(cmd);
    const data = await response.Body?.transformToString()

    return { url, data }
}

export const uploadObjectToS3 = async (key: string, buffer: Buffer, contentType: string) => {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType || 'application/octet-stream',
    });
    await s3.send(command);
    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}