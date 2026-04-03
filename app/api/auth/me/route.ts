export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getRequestAuthUser } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const user = await getRequestAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ data: user })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
