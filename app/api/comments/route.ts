export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = getSession(req)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { targetType, targetId, content, projectId } = await req.json()

    if (!content?.trim() || !targetId || !targetType) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const { createNodeCommentDirect, createComment, createActivityLog } = await import('@/lib/data')

    let comment
    if (targetType === 'Node') {
      comment = await createNodeCommentDirect({
        nodeId: targetId,
        content: content.trim(),
        projectId,
        userId: session.id,
      })
    } else {
      comment = await createComment({ targetType, targetId, content: content.trim(), projectId, userId: session.id })
    }

    if (projectId) {
      await createActivityLog({
        projectId,
        nodeId: targetType === 'Node' ? targetId : undefined,
        action: 'COMMENT_ADDED',
        entityType: 'Comment',
        entityId: comment.id,
        description: `发表了评论`,
        userId: session.id,
      })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('POST comment error:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
