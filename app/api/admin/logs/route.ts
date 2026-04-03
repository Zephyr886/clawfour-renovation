export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const { prisma } = await import('@/lib/prisma')

    const logs = await prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, name: true, username: true, role: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ data: logs })
  } catch (error) {
    console.error('GET logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
