export type Role = 'HOMEOWNER' | 'COMPANY' | 'ADMIN'
export type ProjectPhase = 'PLANNING' | 'DEMOLITION' | 'WATERPROOF' | 'HYDROPOWER' | 'TILING' | 'CARPENTRY' | 'PAINTING' | 'FURNITURE' | 'COMPLETION'
export type NodeStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
export type Urgency = 'NORMAL' | 'TODO' | 'URGENT' | 'EMERGENCY'
export type MaterialStatus = 'NOT_PURCHASED' | 'PURCHASED' | 'DELIVERED'
export type EntryType = 'PHOTO' | 'ISSUE' | 'MATERIAL' | 'DIALOGUE' | 'PROGRESS'

export interface User {
  id: string
  username: string
  role: Role
  name: string | null
  phone: string | null
  email: string | null
  isDisabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description: string | null
  ownerId: string
  phase: ProjectPhase
  startDate: Date | null
  endDate: Date | null
  budget: number | null
  address: string | null
  community: string | null
  contract: string | null
  qrCode: string | null
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  owner?: User
  members?: User[]
  nodes?: Node[]
}

export interface Node {
  id: string
  projectId: string
  title: string
  description: string | null
  phase: ProjectPhase
  status: NodeStatus
  urgency: Urgency
  assignee: string | null
  plannedDate: Date | null
  actualDate: Date | null
  photos: string
  problems: string
  sortOrder: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  project?: Project
  creator?: User
  comments?: Comment[]
  entries?: NodeEntry[]
  materials?: Material[]
}

export interface NodeEntry {
  id: string
  nodeId: string
  type: EntryType
  title: string
  content: string | null
  urgency: Urgency
  mediaUrls: string
  isCompleted: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
  creator?: User
}

export interface Material {
  id: string
  nodeId: string | null
  projectId: string
  name: string
  description: string | null
  category: string
  status: MaterialStatus
  pickupCode: string | null
  quantity: number
  unit: string | null
  price: number | null
  addedBy: string
  createdAt: Date
  updatedAt: Date
  adder?: User
}

export interface Comment {
  id: string
  targetType: string
  targetId: string
  content: string
  userId: string
  projectId: string | null
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface ActivityLog {
  id: string
  projectId: string
  nodeId: string | null
  action: string
  entityType: string
  entityId: string
  changes: string
  userId: string
  createdAt: Date
  user?: User
  project?: Project
}

export interface DashboardSummary {
  project: Project
  totalNodes: number
  completedNodes: number
  inProgressNodes: number
  blockedNodes: number
  pendingNodes: number
  recentComments: Comment[]
  recentLogs: ActivityLog[]
  materials: Material[]
}
