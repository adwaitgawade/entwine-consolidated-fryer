import { uploadObjectToS3 } from "@/lib/aws";

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

    const fileName = (file.name || '').toLowerCase();
    if (!(fileName.endsWith('.ino.bin') || fileName.endsWith('.bin'))) {
        return new Response(JSON.stringify({ message: "Only .bin or .ino.bin files are allowed" }), { status: 400 });
    }

    // Basic validation for organization and version strings
    if (!organization || /[^a-zA-Z0-9._-]/.test(organization)) {
        return new Response(JSON.stringify({ message: "Invalid organization" }), { status: 400 });
    }
    if (!version || /[^0-9.]/.test(version)) {
        return new Response(JSON.stringify({ message: "Invalid version" }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create S3 key following the convention: organization/version.ino.bin
    const s3Key = `${organization}/${version}.ino.bin`;

    try {
        const s3Url = await uploadObjectToS3(s3Key, buffer, file.type || 'application/octet-stream');        
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