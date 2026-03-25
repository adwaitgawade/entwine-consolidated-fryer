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

    ["id", "name"].forEach(key => {
        delete response.data.device[key];
        delete response.data.menu[key];
    });

    const raw: ConfigData = response.data
    const processed = normalizeDoubleDip(raw);
    response.data = processed
    return Response.json({ data: response, success: true, status: 200, error: null }, { status: 200 });
}


interface Quantity {
    quantity: number;
    dipTemperature: number;
    dipTime: number;
    doubleDip: boolean;
    doubleDipTemperature: number | null;
    doubleDipTime: number | null;
}

interface MenuItem {
    id: string;
    itemName: string;
    quantity_count: number[];
    quantity_total: number;
    quantities: Quantity[];
}

interface Device {
    serialNumber: string;
}

interface Menu {
    holdTemperature: number;
    sleepTemperature: number;
    sleepTime: number;
    deepSleepTemperature: number;
    item_count: number;
    items: MenuItem[];
}

interface ConfigData {
    device: Device;
    menu: Menu;
    version: string;
    assignedAt: string;
}

function normalizeDoubleDip(data: ConfigData): ConfigData {
    // Deep clone to avoid mutating the original object
    const processed: ConfigData = JSON.parse(JSON.stringify(data));

    function traverse(obj: any): void {
        if (Array.isArray(obj)) { obj.forEach(traverse); }
        else if (obj && typeof obj === 'object') {
            // If this object has doubleDip field, normalize it
            if (typeof obj.doubleDip === 'boolean') {
                if (obj.doubleDip === false) {
                    obj.doubleDip = 0;
                    obj.doubleDipHoldTime = 0;
                    obj.doubleDipTemperature = 0;
                    obj.doubleDipTime = 0;
                }
                else obj.doubleDip = 1;
            }

            // Recurse into all properties
            Object.keys(obj).forEach((key) => traverse(obj[key]));
        }
    }

    traverse(processed);
    return processed;
}