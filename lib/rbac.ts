import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getRequestAuthUser, type AuthUser } from '@/lib/session'

export type ProjectAction = 'read' | 'write' | 'admin'

export interface AccessContext {
  user: AuthUser
  projectId: string
}

export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const user = await getRequestAuthUser(request)
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { user }
}

export async function requireProjectAccess(
  request: NextRequest,
  projectId: string,
  action: ProjectAction = 'read'
): Promise<{ context: AccessContext } | { error: NextResponse }> {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth

  const allowed = canAccessProject(auth.user, projectId, action)
  if (!allowed) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { context: { user: auth.user, projectId } }
}

export async function requireNodeAccess(
  request: NextRequest,
  nodeId: string,
  action: ProjectAction = 'read'
): Promise<{ context: AccessContext & { node: { id: string; projectId: string; title: string; phaseId: string } } } | { error: NextResponse }> {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth

  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: { id: true, projectId: true, title: true, phaseId: true },
  })

  if (!node) {
    return { error: NextResponse.json({ error: 'Node not found' }, { status: 404 }) }
  }

  const allowed = canAccessProject(auth.user, node.projectId, action)
  if (!allowed) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { context: { user: auth.user, projectId: node.projectId, node } }
}

export async function requireMaterialAccess(
  request: NextRequest,
  materialId: string,
  action: ProjectAction = 'write'
): Promise<{ context: AccessContext & { material: { id: string; projectId: string; name: string; nodeId: string | null } } } | { error: NextResponse }> {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth

  const material = await prisma.material.findUnique({
    where: { id: materialId },
    select: { id: true, projectId: true, name: true, nodeId: true },
  })

  if (!material) {
    return { error: NextResponse.json({ error: 'Material not found' }, { status: 404 }) }
  }

  const allowed = canAccessProject(auth.user, material.projectId, action)
  if (!allowed) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { context: { user: auth.user, projectId: material.projectId, material } }
}

export function canAccessProject(user: AuthUser, projectId: string, action: ProjectAction) {
  if (user.role === 'ADMIN') return true
  if (action === 'admin') return false
  if (user.role === 'HOMEOWNER') {
    return action === 'read' && user.accessibleProjectIds.includes(projectId)
  }
  return user.accessibleProjectIds.includes(projectId)
}

export function canWriteProject(user: AuthUser) {
  return user.role === 'COMPANY' || user.role === 'ADMIN'
}
