export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const entries = await prisma.nodeEntry.findMany({
      where: { nodeId: params.id },
      include: { creator: { select: { id: true, name: true, username: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: entries })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { type, title, content, urgency, createdBy } = body
    if (!title?.trim() || !createdBy) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const entry = await prisma.nodeEntry.create({
      data: {
        nodeId: params.id,
        type: type || 'PROGRESS',
        title: title.trim(),
        content: content?.trim(),
        urgency: urgency || 'NORMAL',
        createdBy,
      },
      include: { creator: { select: { id: true, name: true, username: true, role: true } } },
    })
    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
