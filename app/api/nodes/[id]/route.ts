export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getNodeById } from '@/lib/data'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const node = await getNodeById(params.id)
    if (!node) return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    return NextResponse.json({ data: node })
  } catch (error) {
    console.error('GET node error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const allowedFields = ['status', 'urgency', 'assignee', 'plannedDate', 'actualDate', 'title', 'description']
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field]
    }

    const node = await prisma.node.update({
      where: { id: params.id },
      data: updateData,
    })

    // Log activity
    const nodeWithProject = await prisma.node.findUnique({
      where: { id: params.id },
      include: { phase: { select: { projectId: true } } },
    })
    if (nodeWithProject) {
      await prisma.activityLog.create({
        data: {
          projectId: nodeWithProject.phase.projectId,
          nodeId: params.id,
          action: 'UPDATE',
          entityType: 'Node',
          entityId: params.id,
          description: `更新了节点「${node.title}」`,
          userId: session.id,
        },
      })
    }

    return NextResponse.json({ data: node })
  } catch (error) {
    console.error('PATCH node error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
