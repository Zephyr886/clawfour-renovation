export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role === 'HOMEOWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { name, phaseKey, description, status, order, startDate, endDate } = body

    const { prisma } = await import('@/lib/prisma')
    const existing = await prisma.phase.findUnique({
      where: { id: params.id },
      select: { projectId: true, name: true },
    })
    if (!existing) return NextResponse.json({ error: 'Phase not found' }, { status: 404 })

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (phaseKey !== undefined) updateData.phaseKey = phaseKey
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (order !== undefined) updateData.order = parseInt(order)
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

    const phase = await prisma.phase.update({
      where: { id: params.id },
      data: updateData,
    })

    await prisma.activityLog.create({
      data: {
        projectId: existing.projectId,
        action: 'UPDATED',
        entityType: 'Phase',
        entityId: params.id,
        description: `更新了阶段「${phase.name}」`,
        userId: session.id,
      },
    })

    return NextResponse.json({ data: phase })
  } catch (error) {
    console.error('PATCH phase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 })

    const { prisma } = await import('@/lib/prisma')
    const existing = await prisma.phase.findUnique({
      where: { id: params.id },
      select: { projectId: true, name: true },
    })
    if (!existing) return NextResponse.json({ error: 'Phase not found' }, { status: 404 })

    await prisma.phase.delete({ where: { id: params.id } })

    await prisma.activityLog.create({
      data: {
        projectId: existing.projectId,
        action: 'DELETED',
        entityType: 'Phase',
        entityId: params.id,
        description: `删除了阶段「${existing.name}」`,
        userId: session.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE phase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
