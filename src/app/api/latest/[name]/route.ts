import { s3, bucket } from "@/lib/aws";
import semver, { SemVer } from "semver";
import type { NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET(request: NextRequest, { params }: { params: Promise<{name:string}>}) {
  const { name } = await params;
  
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
  
  return Response.json(file,{
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60",
      }
    }
  );
}