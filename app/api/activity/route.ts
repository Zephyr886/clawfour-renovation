export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getActivities } from '@/lib/data'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId') || undefined
    const limit = Number(searchParams.get('limit') || 20)
    const activities = await getActivities(projectId, limit)
    return NextResponse.json(activities)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
