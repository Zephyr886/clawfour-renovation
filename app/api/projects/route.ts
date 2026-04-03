export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getProjects } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const projects = await getProjects(session.id, session.role)
    return NextResponse.json({ data: projects })
  } catch (error) {
    console.error('GET projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 })

    const body = await request.json()
    const { name, description, address, area, community, budget, startDate, endDate } = body

    if (!name) {
      return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 })
    }

    const { prisma } = await import('@/lib/prisma')

    const project = await prisma.project.create({
      data: {
        name,
        description,
        address,
        area: area ? parseFloat(area) : null,
        community,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId: session.id,
        status: 'PLANNING',
      },
      include: {
        owner: { select: { id: true, name: true, username: true, role: true } },
      },
    })

    await prisma.activityLog.create({
      data: {
        projectId: project.id,
        action: 'CREATED',
        entityType: 'Project',
        entityId: project.id,
        description: `创建了项目「${name}」`,
        userId: session.id,
      },
    })

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    console.error('POST project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
