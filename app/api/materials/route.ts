export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: '项目ID不能为空' }, { status: 400 })
    }

    const materials = await prisma.material.findMany({
      where: { projectId },
      include: {
        adder: { select: { id: true, name: true, username: true } },
        node: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: materials })
  } catch (error) {
    console.error('GET materials error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role === 'HOMEOWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { projectId, nodeId, name, description, category, status, pickupCode, quantity, unit, price } = body

    if (!projectId || !name) {
      return NextResponse.json({ error: '项目ID和材料名称不能为空' }, { status: 400 })
    }

    const material = await prisma.material.create({
      data: {
        projectId,
        nodeId: nodeId || null,
        name,
        description,
        category: category || 'main',
        status: status || 'NOT_PURCHASED',
        pickupCode,
        quantity: quantity ? parseInt(quantity.toString()) : 1,
        unit,
        price: price ? parseFloat(price.toString()) : null,
        addedBy: session.id,
      },
      include: {
        adder: { select: { id: true, name: true, username: true } },
        node: { select: { id: true, title: true } },
      },
    })

    await prisma.activityLog.create({
      data: {
        projectId,
        nodeId: nodeId || null,
        action: 'CREATE',
        entityType: 'MATERIAL',
        entityId: material.id,
        changes: JSON.stringify({ name, status: material.status }),
        userId: session.id,
      },
    })

    return NextResponse.json({ data: material }, { status: 201 })
  } catch (error) {
    console.error('POST material error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
