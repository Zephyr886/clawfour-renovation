export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSession(request)
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { password, role, name, phone, email, isDisabled } = body

    const existingUser = await prisma.user.findUnique({ where: { id: params.id } })
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updateData: any = {
      ...(role && { role }),
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(isDisabled !== undefined && { isDisabled }),
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        name: true,
        phone: true,
        email: true,
        isDisabled: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ data: user })
  } catch (error) {
    console.error('PUT user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
