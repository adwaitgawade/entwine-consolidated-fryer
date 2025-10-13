import type { NextRequest } from "next/server";
import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import semver, { SemVer } from "semver";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

export async function GET(request: NextRequest, { params }: { params: Promise<{name:string}>}) {
  const { name } = await params;
  
  const bucket = process.env.AWS_S3_BUCKET!;

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: name,
  })

  const data = await s3.send(command);
    
  const files = data.Contents?.
    filter((obj) => obj.Key?.endsWith(".ino.bin")).
    map((obj) => ({
      key: obj.Key!,
      version: obj.Key!.split("/").pop()!.split(".ino.bin")[0],
      url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`,
    })) || [];
  
  
  const versions = files.map((file) => file.version);
  semver.sort(versions as unknown as SemVer[]).reverse();
  
  const file: { key: string, version: string, url: string } | undefined = files.find((file) => file.version === versions[0]);

  if (!file) {
    return Response.json({
      error: "File not found"
    }, { status: 404 });
  }

  const filegetcommand = new GetObjectCommand({
    Bucket: bucket,
    Key: file.key,
  });

   file.url = (await getSignedUrl(s3, filegetcommand, { expiresIn: 3600 })).replace("https://", "http://"); // 1 hour
  
  return Response.json(file);
}