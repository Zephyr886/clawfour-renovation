// Since we use SQLite (no enum support), all enum fields are String types
// Keep this file for type-level constants and interfaces

export type Role = 'HOMEOWNER' | 'COMPANY' | 'ADMIN'
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
export type PhaseStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
export type NodeStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
export type Urgency = 'NORMAL' | 'TODO' | 'URGENT' | 'EMERGENCY'
export type MaterialStatus = 'NOT_PURCHASED' | 'ORDERED' | 'PURCHASED' | 'DELIVERED' | 'INSTALLED'
export type EntryType = 'PHOTO' | 'ISSUE' | 'MATERIAL' | 'DIALOGUE' | 'PROGRESS' | 'INSPECTION'
export type LogAction = 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED' | 'COMMENT_ADDED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED'

// Prisma-generated types
import type {
  User,
  Project,
  Phase,
  Node,
  NodeEntry,
  ProgressRecord,
  Material,
  Comment,
  ActivityLog,
} from '@prisma/client'

export type {
  User,
  Project,
  Phase,
  Node,
  NodeEntry,
  ProgressRecord,
  Material,
  Comment,
  ActivityLog,
}

export interface UserSummary {
  id: string
  username: string
  name: string | null
  role: string
}

export interface ProjectWithRelations extends Project {
  owner: UserSummary
  members: UserSummary[]
  phases: PhaseWithNodes[]
  _count?: {
    materials: number
    comments: number
    logs: number
  }
}

export interface PhaseWithNodes extends Phase {
  nodes: NodeSummary[]
}

export interface NodeSummary extends Node {
  creator?: UserSummary
  _count?: {
    comments: number
    materials: number
    entries: number
    progressRecords: number
  }
}

export interface NodeWithRelations extends Node {
  phase: Phase & { project: Project }
  creator: UserSummary
  comments: CommentWithUser[]
  materials: MaterialWithUser[]
  entries: NodeEntryWithUser[]
  progressRecords: ProgressRecordWithUser[]
  logs?: ActivityLogWithUser[]
}

export interface CommentWithUser extends Comment {
  user: UserSummary
}

export interface MaterialWithUser extends Material {
  adder: UserSummary
  node?: { id: string; title: string } | null
}

export interface NodeEntryWithUser extends NodeEntry {
  creator: UserSummary
}

export interface ProgressRecordWithUser extends ProgressRecord {
  recorder: UserSummary
}

export interface ActivityLogWithUser extends ActivityLog {
  user: UserSummary
  project?: { id: string; name: string }
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalNodes: number
  pendingNodes: number
  completedNodes: number
  recentActivity: ActivityLogWithUser[]
}

export interface SessionUser {
  id: string
  username: string
  name: string | null
  role: string
}
