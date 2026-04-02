export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { status, quantity, price } = body

    const material = await prisma.material.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(quantity !== undefined ? { quantity: parseInt(quantity) } : {}),
        ...(price !== undefined ? { price: parseFloat(price) } : {}),
      },
    })

    return NextResponse.json({ data: material })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(request)
    if (!session || session.role === 'HOMEOWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await prisma.material.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
