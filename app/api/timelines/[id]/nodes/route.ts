export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireProjectAccess } from '@/lib/rbac'

// GET /api/timelines/[id]/nodes - list all nodes for a project grouped by phase
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const access = await requireProjectAccess(request, params.id, 'read')
    if ('error' in access) return access.error

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
    const access = await requireProjectAccess(request, params.id, 'write')
    if ('error' in access) return access.error

    const body = await request.json()
    const { phaseId, title, description, urgency, assignee, plannedDate, actualDate, status, order } = body

    if (!phaseId || !title) {
      return NextResponse.json({ error: '阶段ID和节点名称不能为空' }, { status: 400 })
    }

    const phase = await prisma.phase.findFirst({
      where: { id: phaseId, projectId: params.id },
      select: { id: true },
    })
    if (!phase) {
      return NextResponse.json({ error: '阶段不存在或不属于当前项目' }, { status: 400 })
    }

    const maxOrder = await prisma.node.aggregate({ where: { phaseId }, _max: { order: true } })

    const node = await prisma.$transaction(async tx => {
      return tx.node.create({
        data: {
          phaseId,
          projectId: params.id,
          title,
          description,
          urgency: urgency || 'NORMAL',
          assignee,
          plannedDate: plannedDate ? new Date(plannedDate) : null,
          actualDate: actualDate ? new Date(actualDate) : null,
          status: status || 'PENDING',
          order: Number.isFinite(Number(order)) ? Number(order) : (maxOrder._max.order || 0) + 1,
          createdBy: access.context.user.id,
        },
      })
    })

    await prisma.activityLog.create({
      data: {
        projectId: params.id,
        nodeId: node.id,
        action: 'CREATED',
        entityType: 'Node',
        entityId: node.id,
        description: `创建了节点「${title}」`,
        userId: access.context.user.id,
      },
    })

    return NextResponse.json({ data: node }, { status: 201 })
  } catch (error) {
    console.error('POST node error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
