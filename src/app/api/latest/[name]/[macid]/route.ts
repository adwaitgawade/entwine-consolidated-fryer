import semver, { SemVer } from "semver";
import type { NextRequest } from "next/server";
import { getObjectUrl, getJsonVersions, getVersions } from "@/lib/aws";

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string, macid: string }> }) {
    const { name, macid } = await params;

    const searchParams = request.nextUrl.searchParams;
    const type_ = searchParams.get("type")

    const files = type_ == 'json' ? await getJsonVersions(name + "/" + macid) : await getVersions(name + "/" + macid);

    const versions = files.map((file: { version: string }) => file.version);
    semver.sort(versions as unknown as SemVer[]).reverse();

    const file: { key: string, version: string, url: string } | undefined = files.find((file: { version: string }) => file.version === versions[0]);

    if (!file) {
        return Response.json({ data: null, success: false, status: 404, error: "File not found" }, { status: 404 })
    }

    const { url, data } = await getObjectUrl(file.key);
    file.url = url;
    const response = { ...file, data: type_ == 'json' ? JSON.parse(data!) : null };

    return Response.json({ data: response, success: true, status: 200, error: null }, { status: 200 });
}