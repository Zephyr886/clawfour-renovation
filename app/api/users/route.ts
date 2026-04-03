export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // HOMEOWNER can only get basic user list for assignee selection
    const { prisma } = await import('@/lib/prisma')
    const users = await prisma.user.findMany({
      where: { isDisabled: false },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('GET users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
