export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prisma } = await import('@/lib/prisma')
    const entries = await prisma.nodeEntry.findMany({
      where: { nodeId: params.id },
      include: { creator: { select: { id: true, name: true, username: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: entries })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prisma } = await import('@/lib/prisma')
    const body = await request.json()
    const { type, title, content, urgency } = body
    if (!title?.trim()) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const node = await prisma.node.findUnique({
      where: { id: params.id },
      select: { projectId: true }
    })
    if (!node) return NextResponse.json({ error: 'Node not found' }, { status: 404 })

    const entry = await prisma.nodeEntry.create({
      data: {
        nodeId: params.id,
        type: type || 'PROGRESS',
        title: title.trim(),
        content: content?.trim(),
        urgency: urgency || 'NORMAL',
        createdBy: session.id,
      },
      include: { creator: { select: { id: true, name: true, username: true, role: true } } },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        projectId: node.projectId,
        nodeId: params.id,
        action: 'CREATED',
        entityType: 'NodeEntry',
        entityId: entry.id,
        description: `新增了工作记录「${title}」`,
        userId: session.id,
      },
    })

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
