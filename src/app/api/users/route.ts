import { user } from '@/db/schema'
import { NextRequest } from 'next/server'
import { devdb, productiondb } from '@/db'

function getDb(db: string) {
  if (db === 'prod') return productiondb
  return devdb
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dbParam = searchParams.get('db') || 'dev'
  const db = getDb(dbParam)

  try {
    const users = await db.select().from(user)
    return Response.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
