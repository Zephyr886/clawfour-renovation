import prisma from '@/lib/prisma'

// ============================================================
// Projects
// ============================================================

export async function getProjects(userId?: string, role?: string) {
  const where =
    role === 'HOMEOWNER' && userId
      ? { ownerId: userId, status: { not: "ARCHIVED" } }
      : role === 'COMPANY' && userId
      ? {
          status: { not: "ARCHIVED" },
          OR: [
            { ownerId: userId },
            { members: { some: { id: userId } } },
          ],
        }
      : { status: { not: "ARCHIVED" } }

  return prisma.project.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, username: true, role: true } },
      members: { select: { id: true, name: true, username: true, role: true } },
      phases: {
        include: {
          nodes: {
            select: { id: true, status: true, urgency: true, title: true, order: true },
          },
        },
        orderBy: { order: 'asc' },
      },
      _count: { select: { materials: true, comments: true, logs: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      owner: true,
      members: true,
      phases: {
        include: {
          nodes: {
            include: {
              creator: { select: { id: true, name: true, username: true } },
              _count: { select: { materials: true, entries: true } },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      _count: { select: { materials: true, comments: true, logs: true } },
    },
  })
}

export async function getProjectTimeline(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, username: true, role: true } },
      members: { select: { id: true, name: true, username: true, role: true } },
      phases: {
        include: {
          nodes: {
            include: {
              creator: { select: { id: true, name: true, username: true } },
              _count: { select: { materials: true, entries: true } },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })
}

// ============================================================
// Nodes
// ============================================================

export async function getNodeById(nodeId: string) {
  return prisma.node.findUnique({
    where: { id: nodeId },
    include: {
      phase: { include: { project: true } },
      creator: { select: { id: true, name: true, username: true, role: true } },
      materials: {
        include: { adder: { select: { id: true, name: true, username: true } } },
        orderBy: { createdAt: 'desc' },
      },
      entries: {
        include: { creator: { select: { id: true, name: true, username: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      },
      nodeComments: {
        include: { user: { select: { id: true, name: true, username: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
      progressRecords: {
        include: { recorder: { select: { id: true, name: true, username: true, role: true } } },
        orderBy: { recordedAt: 'desc' },
      },
      activityLogs: {
        include: { user: { select: { id: true, name: true, username: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })
}

// ============================================================
// Dashboard Stats
// ============================================================

export async function getDashboardStats(userId?: string, role?: string) {
  const projectWhere =
    role === 'HOMEOWNER' && userId
      ? { ownerId: userId }
      : role === 'COMPANY' && userId
      ? {
          OR: [
            { ownerId: userId },
            { members: { some: { id: userId } } },
          ],
        }
      : {}

  const [totalProjects, activeProjects, completedProjects] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    prisma.project.count({ where: { ...projectWhere, status: 'IN_PROGRESS' } }),
    prisma.project.count({ where: { ...projectWhere, status: 'COMPLETED' } }),
  ])

  const projectIds = await prisma.project.findMany({
    where: projectWhere,
    select: { id: true },
  })
  const ids = projectIds.map((p: { id: string }) => p.id)

  const nodeWhere = ids.length > 0 ? { phase: { projectId: { in: ids } } } : {}

  const [totalNodes, pendingNodes, completedNodes, inProgressNodes] = await Promise.all([
    prisma.node.count({ where: nodeWhere }),
    prisma.node.count({ where: { ...nodeWhere, status: 'PENDING' } }),
    prisma.node.count({ where: { ...nodeWhere, status: 'COMPLETED' } }),
    prisma.node.count({ where: { ...nodeWhere, status: 'IN_PROGRESS' } }),
  ])

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalNodes,
    pendingNodes,
    completedNodes,
    inProgressNodes,
  }
}

// ============================================================
// Node Comments (via NodeComment model - node-specific)
// ============================================================

export async function getNodeComments(nodeId: string) {
  return prisma.nodeComment.findMany({
    where: { nodeId },
    include: { user: { select: { id: true, name: true, username: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createNodeCommentDirect(data: {
  nodeId: string
  content: string
  projectId?: string
  userId: string
}) {
  return prisma.nodeComment.create({
    data: {
      nodeId: data.nodeId,
      content: data.content,
      projectId: data.projectId,
      userId: data.userId,
    },
    include: {
      user: { select: { id: true, name: true, username: true, role: true } },
    },
  })
}

// ============================================================
// Generic Comments
// ============================================================

export async function createComment(data: {
  targetType: string
  targetId: string
  content: string
  projectId?: string
  userId: string
}) {
  return prisma.comment.create({
    data,
    include: {
      user: { select: { id: true, name: true, username: true, role: true } },
    },
  })
}

// ============================================================
// Progress Records
// ============================================================

export async function getProgressRecords(nodeId: string) {
  return prisma.progressRecord.findMany({
    where: { nodeId },
    include: { recorder: { select: { id: true, name: true, username: true, role: true } } },
    orderBy: { recordedAt: 'desc' },
  })
}

export async function createProgressRecord(data: {
  nodeId: string
  percentage: number
  note?: string
  recordedBy: string
}) {
  return prisma.progressRecord.create({
    data: {
      nodeId: data.nodeId,
      percentage: data.percentage,
      note: data.note,
      recordedBy: data.recordedBy,
    },
    include: {
      recorder: { select: { id: true, name: true, username: true, role: true } },
    },
  })
}

// ============================================================
// Materials
// ============================================================

export async function getMaterials(projectId: string) {
  return prisma.material.findMany({
    where: { projectId },
    include: {
      adder: { select: { id: true, name: true, username: true } },
      node: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createMaterial(data: {
  projectId: string
  nodeId?: string
  name: string
  description?: string
  brand?: string
  category?: string
  status?: string
  quantity?: number
  unit?: string
  price?: number
  addedBy: string
}) {
  return prisma.material.create({ data })
}

// ============================================================
// Activity Logs
// ============================================================

export async function getActivities(projectId?: string, limit = 20) {
  return prisma.activityLog.findMany({
    where: projectId ? { projectId } : {},
    include: {
      user: { select: { id: true, name: true, username: true, role: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function createActivityLog(data: {
  projectId: string
  nodeId?: string
  action: string
  entityType: string
  entityId: string
  description?: string
  userId: string
}) {
  return prisma.activityLog.create({ data })
}

// ============================================================
// Users
// ============================================================

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      email: true,
      phone: true,
      isDisabled: true,
      createdAt: true,
      _count: { select: { ownedProjects: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      email: true,
      phone: true,
      isDisabled: true,
      createdAt: true,
    },
  })
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } })
}
