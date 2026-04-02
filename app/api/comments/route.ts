export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createNodeCommentDirect, createComment, createActivityLog } from '@/lib/data'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { targetType, targetId, content, projectId } = await req.json()

    // In demo mode, pick a homeowner user
    const user = await prisma.user.findFirst({ where: { role: 'HOMEOWNER' } })
    if (!user) throw new Error('No user found')

    let comment
    if (targetType === 'Node') {
      comment = await createNodeCommentDirect({
        nodeId: targetId,
        content,
        projectId,
        userId: user.id,
      })
    } else {
      comment = await createComment({ targetType, targetId, content, projectId, userId: user.id })
    }

    if (projectId) {
      await createActivityLog({
        projectId,
        nodeId: targetType === 'Node' ? targetId : undefined,
        action: 'COMMENT_ADDED',
        entityType: 'Comment',
        entityId: comment.id,
        description: '发表了评论',
        userId: user.id,
      })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
