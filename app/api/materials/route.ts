export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireProjectAccess } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) return auth.error

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const nodeId = searchParams.get('nodeId')

    if (!projectId && !nodeId) {
      return NextResponse.json({ error: '项目ID或节点ID不能为空' }, { status: 400 })
    }

    let resolvedProjectId = projectId
    if (!resolvedProjectId && nodeId) {
      const node = await prisma.node.findUnique({ where: { id: nodeId }, select: { projectId: true } })
      resolvedProjectId = node?.projectId || null
    }

    if (!resolvedProjectId) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    const access = await requireProjectAccess(request, resolvedProjectId, 'read')
    if ('error' in access) return access.error

    const where: any = { projectId: resolvedProjectId }
    if (nodeId) where.nodeId = nodeId

    const materials = await prisma.material.findMany({
      where,
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
    const body = await request.json()
    const { projectId, nodeId, name, description, brand, category, status, pickupCode, quantity, unit, price } = body

    if (!projectId || !name) {
      return NextResponse.json({ error: '项目ID和材料名称不能为空' }, { status: 400 })
    }

    const access = await requireProjectAccess(request, projectId, 'write')
    if ('error' in access) return access.error

    if (nodeId) {
      const node = await prisma.node.findFirst({ where: { id: nodeId, projectId }, select: { id: true } })
      if (!node) return NextResponse.json({ error: '关联节点不存在或不属于当前项目' }, { status: 400 })
    }

    const material = await prisma.material.create({
      data: {
        projectId,
        nodeId: nodeId || null,
        name,
        description,
        brand,
        category: category || 'main',
        status: status || 'NOT_PURCHASED',
        pickupCode,
        quantity: quantity ? parseInt(quantity.toString()) : 1,
        unit,
        price: price ? parseFloat(price.toString()) : null,
        addedBy: access.context.user.id,
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
        action: 'CREATED',
        entityType: 'Material',
        entityId: material.id,
        description: `新增了材料「${name}」`,
        changes: JSON.stringify({ name, status: material.status }),
        userId: access.context.user.id,
      },
    })

    return NextResponse.json({ data: material }, { status: 201 })
  } catch (error) {
    console.error('POST material error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
