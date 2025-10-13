import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
})
const bucket = process.env.AWS_S3_BUCKET!;

export async function POST(request: Request) {
    // Check authentication first
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ message: "Authentication required" }), { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const token = authHeader.substring(7);
    const validUsername = process.env.UPLOAD_USERNAME;
    const validPassword = process.env.UPLOAD_PASSWORD;
    
    // Simple token validation (in production, use proper JWT or session tokens)
    if (token !== `${validUsername}:${validPassword}`) {
        return new Response(JSON.stringify({ message: "Invalid authentication token" }), { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const formData = await request.formData();
    const version = String(formData.get("version") ?? "");
    const organization = String(formData.get("organization")).replace("/", "");
    const file = formData.get("file") as File | null;

    if (!file) {
        return new Response(JSON.stringify({ message: "No file provided" }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create S3 key following the convention: organization/version.ino.bin
    const s3Key = `${organization}/${version}.ino.bin`;
    // Upload to S3
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
    });

    try {
        await s3.send(command);
        
        const s3Url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        
        return Response.json({
            message: "File uploaded successfully to S3",
            url: s3Url,
            key: s3Key,
            bytes: buffer.byteLength,
            meta: { organization, version }
        });
    } catch (error) {
        console.error("S3 upload error:", error);
        return new Response(JSON.stringify({ message: "Failed to upload to S3" }), { status: 500 });
    }
}