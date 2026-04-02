import { cache } from 'react'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { COOKIE_NAME, verifyToken, type JWTPayload } from '@/lib/auth'

export type AuthUser = JWTPayload & {
  email?: string | null
  phone?: string | null
  isDisabled: boolean
  accessibleProjectIds: string[]
}

export const getCurrentAuthUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    return await hydrateAuthUser(payload)
  } catch {
    return null
  }
})

export async function getRequestAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return hydrateAuthUser(payload)
}

async function hydrateAuthUser(payload: JWTPayload): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      username: true,
      role: true,
      name: true,
      email: true,
      phone: true,
      isDisabled: true,
      ownedProjects: { select: { id: true } },
      memberProjects: { select: { id: true } },
    },
  })

  if (!user || user.isDisabled) return null

  const accessibleProjectIds = user.role === 'ADMIN'
    ? []
    : Array.from(new Set([...user.ownedProjects.map(p => p.id), ...user.memberProjects.map(p => p.id)]))

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isDisabled: user.isDisabled,
    accessibleProjectIds,
  }
}
