export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireMaterialAccess } from '@/lib/rbac'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const access = await requireMaterialAccess(request, params.id, 'write')
    if ('error' in access) return access.error

    const body = await request.json()
    const { status, quantity, price, name, brand, description, category, unit, nodeId } = body

    if (nodeId !== undefined && nodeId !== null) {
      const { prisma } = await import('@/lib/prisma')
      const node = await prisma.node.findFirst({
        where: { id: nodeId, projectId: access.context.projectId },
        select: { id: true },
      })
      if (!node) {
        return NextResponse.json({ error: '关联节点不存在或不属于当前项目' }, { status: 400 })
      }
    }

    const updateData: Record<string, any> = {}
    if (status !== undefined) updateData.status = status
    if (quantity !== undefined) updateData.quantity = parseInt(quantity)
    if (price !== undefined) updateData.price = price !== null ? parseFloat(price) : null
    if (name !== undefined) updateData.name = name
    if (brand !== undefined) updateData.brand = brand
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (unit !== undefined) updateData.unit = unit
    if (nodeId !== undefined) updateData.nodeId = nodeId || null

    const material = await prisma.material.update({
      where: { id: params.id },
      data: updateData,
      include: {
        adder: { select: { id: true, name: true, username: true } },
        node: { select: { id: true, title: true } },
      },
    })

    await prisma.activityLog.create({
      data: {
        projectId: access.context.projectId,
        action: 'UPDATED',
        entityType: 'Material',
        entityId: params.id,
        description: `更新了材料「${material.name}」`,
        changes: JSON.stringify(updateData),
        userId: access.context.user.id,
      },
    })

    return NextResponse.json({ data: material })
  } catch (error) {
    console.error('PATCH material error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const access = await requireMaterialAccess(request, params.id, 'write')
    if ('error' in access) return access.error

    await prisma.material.delete({ where: { id: params.id } })

    await prisma.activityLog.create({
      data: {
        projectId: access.context.projectId,
        action: 'DELETED',
        entityType: 'Material',
        entityId: params.id,
        description: `删除了材料「${access.context.material.name}」`,
        userId: access.context.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
