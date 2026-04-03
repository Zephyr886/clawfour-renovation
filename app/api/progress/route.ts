export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { nodeId, percentage, note, projectId } = body

    if (!nodeId || percentage === undefined) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const pct = Math.max(0, Math.min(100, parseInt(percentage)))

    const { prisma } = await import('@/lib/prisma')
    const record = await prisma.progressRecord.create({
      data: {
        nodeId,
        percentage: pct,
        note: note?.trim() || null,
        recordedBy: session.id,
      },
      include: { recorder: { select: { id: true, name: true, username: true, role: true } } },
    })

    if (projectId) {
      await prisma.activityLog.create({
        data: {
          projectId,
          nodeId,
          action: 'PROGRESS_UPDATED',
          entityType: 'ProgressRecord',
          entityId: record.id,
          description: `更新节点进度至 ${pct}%`,
          userId: session.id,
        },
      })
    }

    return NextResponse.json({ data: record }, { status: 201 })
  } catch (error) {
    console.error('POST progress error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get('nodeId')
    if (!nodeId) return NextResponse.json({ error: 'nodeId required' }, { status: 400 })

    const records = await prisma.progressRecord.findMany({
      where: { nodeId },
      include: { recorder: { select: { id: true, name: true, username: true, role: true } } },
      orderBy: { recordedAt: 'desc' },
    })

    return NextResponse.json({ data: records })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
