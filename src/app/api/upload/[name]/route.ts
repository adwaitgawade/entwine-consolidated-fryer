import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
})
export async function POST(request: Request, { params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const { version, inoFile, organization } = await request.json();
    console.log(name, version, inoFile, organization);
    return Response.json({ message: "File uploaded successfully" });
}