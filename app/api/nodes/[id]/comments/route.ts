export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comments = await prisma.nodeComment.findMany({
      where: { nodeId: params.id },
      include: { user: { select: { id: true, name: true, username: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ data: comments })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { content } = body
    if (!content?.trim()) return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })

    const node = await prisma.node.findUnique({
      where: { id: params.id },
      select: { id: true, projectId: true },
    })
    if (!node) return NextResponse.json({ error: '节点不存在' }, { status: 404 })

    const comment = await prisma.nodeComment.create({
      data: { nodeId: params.id, content: content.trim(), userId: session.id, projectId: node.projectId },
      include: { user: { select: { id: true, name: true, username: true, role: true } } },
    })

    await prisma.activityLog.create({
      data: {
        projectId: node.projectId,
        nodeId: params.id,
        action: 'COMMENT_ADDED',
        entityType: 'NodeComment',
        entityId: comment.id,
        description: `对节点发表了评论`,
        userId: session.id,
      },
    })

    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
