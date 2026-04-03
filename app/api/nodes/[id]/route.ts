export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireNodeAccess } from '@/lib/rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = await requireNodeAccess(request, params.id, 'read')
    if ('error' in access) return access.error

    const { getNodeById } = await import('@/lib/data')
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
    const { prisma } = await import('@/lib/prisma')
    const access = await requireNodeAccess(request, params.id, 'write')
    if ('error' in access) return access.error

    const body = await request.json()
    const allowedFields = ['status', 'urgency', 'assignee', 'plannedDate', 'actualDate', 'title', 'description', 'phaseId', 'order']
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'plannedDate' || field === 'actualDate') {
          updateData[field] = body[field] ? new Date(body[field]) : null
        } else if (field === 'order') {
          updateData[field] = parseInt(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const targetPhaseId = updateData.phaseId || access.context.node.phaseId
    const targetPhase = await prisma.phase.findFirst({
      where: { id: targetPhaseId, projectId: access.context.projectId },
      select: { id: true },
    })
    if (!targetPhase) {
      return NextResponse.json({ error: '目标阶段不存在或不属于当前项目' }, { status: 400 })
    }

    const node = await prisma.$transaction(async tx => {
      const updated = await tx.node.update({
        where: { id: params.id },
        data: updateData,
      })
      return updated
    })

    await prisma.activityLog.create({
      data: {
        projectId: access.context.projectId,
        nodeId: params.id,
        action: 'UPDATED',
        entityType: 'Node',
        entityId: params.id,
        description: `更新了节点「${node.title}」`,
        changes: JSON.stringify(updateData),
        userId: access.context.user.id,
      },
    })

    return NextResponse.json({ data: node })
  } catch (error) {
    console.error('PATCH node error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const access = await requireNodeAccess(request, params.id, 'write')
    if ('error' in access) return access.error

    await prisma.$transaction(async tx => {
      await tx.node.delete({ where: { id: params.id } })
    })

    await prisma.activityLog.create({
      data: {
        projectId: access.context.projectId,
        action: 'DELETED',
        entityType: 'Node',
        entityId: params.id,
        description: `删除了节点「${access.context.node.title}」`,
        userId: access.context.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE node error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
