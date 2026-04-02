export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/timelines/[id]/nodes - list all nodes for a project grouped by phase
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const phases = await prisma.phase.findMany({
      where: { projectId: params.id },
      include: {
        nodes: {
          include: {
            creator: { select: { id: true, name: true, username: true } },
            _count: { select: { nodeComments: true, materials: true, entries: true } },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: phases })
  } catch (error) {
    console.error('GET phases/nodes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/timelines/[id]/nodes - create a node in a phase
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role === 'HOMEOWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { phaseId, title, description, urgency, assignee, plannedDate } = body

    if (!phaseId || !title) {
      return NextResponse.json({ error: '阶段ID和节点名称不能为空' }, { status: 400 })
    }

    const node = await prisma.node.create({
      data: {
        phaseId,
        projectId: params.id,
        title,
        description,
        urgency: urgency || 'NORMAL',
        assignee,
        plannedDate: plannedDate ? new Date(plannedDate) : null,
        createdBy: session.id,
      },
    })

    await prisma.activityLog.create({
      data: {
        projectId: params.id,
        nodeId: node.id,
        action: 'CREATED',
        entityType: 'Node',
        entityId: node.id,
        description: `创建了节点「${title}」`,
        userId: session.id,
      },
    })

    return NextResponse.json({ data: node }, { status: 201 })
  } catch (error) {
    console.error('POST node error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
