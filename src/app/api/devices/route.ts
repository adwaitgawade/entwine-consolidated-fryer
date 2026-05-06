import { eq } from 'drizzle-orm'
import { device } from '@/db/schema'
import { NextRequest } from 'next/server'
import { devdb, productiondb } from '@/db'

function getDb(db: string) {
  if (db === 'prod') return productiondb
  return devdb
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dbParam = searchParams.get('db') || 'dev'
  const userId = searchParams.get('userId')
  const db = getDb(dbParam)

  try {
    if (userId) {
      const devices = await db.select().from(device).where(eq(device.userId, userId))
      return Response.json({ devices })
    }
    return Response.json({ devices: [] })
  } catch (error) {
    console.error('Error fetching devices:', error)
    return Response.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { db: dbParam, devices: devicesToAdd } = body
    const db = getDb(dbParam || 'dev')

    if (!devicesToAdd || !Array.isArray(devicesToAdd) || devicesToAdd.length === 0) {
      return Response.json({ error: 'No devices provided' }, { status: 400 })
    }

    const results = []
    for (const deviceData of devicesToAdd) {
      const { name, macid, userId, displayName } = deviceData
      if (!name || !macid || !userId) {
        return Response.json({ error: 'Name, macid, and userId are required' }, { status: 400 })
      }
      const result = await db.insert(device).values({
        name,
        macid,
        userId,
        displayName: displayName || null,
      }).returning()
      results.push(result[0])
    }

    return Response.json({ devices: results })
  } catch (error) {
    console.error('Error creating devices:', error)
    return Response.json({ error: 'Failed to create devices' }, { status: 500 })
  }
}
