export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getRequestAuthUser } from '@/lib/session'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getRequestAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getProjectById } = await import('@/lib/data')
    const project = await getProjectById(params.id, user)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}
