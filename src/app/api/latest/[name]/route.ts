import semver, { SemVer } from "semver";
import type { NextRequest } from "next/server";
import { getVersions, getObjectUrl } from "@/lib/aws";

export async function GET(request: NextRequest, { params }: { params: Promise<{name:string}>}) {
  const { name } = await params;

  const files = await getVersions(name);

  const versions = files.map((file: { version: string }) => file.version);
  semver.sort(versions as unknown as SemVer[]).reverse();
  
  const file: { key: string, version: string, url: string } | undefined = files.find((file: { version: string }) => file.version === versions[0]);

  if (!file) {
    return Response.json({
      error: "File not found"
    }, { status: 404 });
  }

  file.url = await getObjectUrl(file.key);
  
  return Response.json(file);
}