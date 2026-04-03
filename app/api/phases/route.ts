export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role === 'HOMEOWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { projectId, name, phaseKey, description, order } = body

    if (!projectId || !name) {
      return NextResponse.json({ error: '项目ID和阶段名称不能为空' }, { status: 400 })
    }

    // Get max order if not provided
    let phaseOrder = order
    if (phaseOrder === undefined) {
      const maxOrder = await prisma.phase.aggregate({
        where: { projectId },
        _max: { order: true },
      })
      phaseOrder = (maxOrder._max.order ?? -1) + 1
    }

    const phase = await prisma.phase.create({
      data: {
        projectId,
        name,
        phaseKey: phaseKey || 'PLANNING',
        description,
        order: phaseOrder,
        status: 'PENDING',
      },
      include: {
        nodes: true,
      },
    })

    await prisma.activityLog.create({
      data: {
        projectId,
        action: 'CREATED',
        entityType: 'Phase',
        entityId: phase.id,
        description: `新增了阶段「${name}」`,
        userId: session.id,
      },
    })

    return NextResponse.json({ data: phase }, { status: 201 })
  } catch (error) {
    console.error('POST phase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
