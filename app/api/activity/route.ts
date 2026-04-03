export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId') || undefined
    const limit = Number(searchParams.get('limit') || 20)
    const { getActivities } = await import('@/lib/data')
    const activities = await getActivities(projectId, limit)
    return NextResponse.json(activities)
  } catch (error) {
    console.error('GET activity error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
