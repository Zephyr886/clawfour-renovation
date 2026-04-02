import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return formatDate(date)
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '¥0'
  return `¥${amount.toLocaleString('zh-CN')}`
}

export function parseJsonArray(json: string | null | undefined): string[] {
  try {
    if (!json) return []
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PLANNING: '规划中',
    IN_PROGRESS: '进行中',
    ON_HOLD: '暂停',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    PENDING: '待开始',
    BLOCKED: '受阻',
    SKIPPED: '已跳过',
    NOT_PURCHASED: '未采购',
    ORDERED: '已下单',
    PURCHASED: '已购买',
    DELIVERED: '已到货',
    INSTALLED: '已安装',
  }
  return labels[status] || status
}

export function urgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    NORMAL: '正常',
    TODO: '待办',
    URGENT: '紧急',
    EMERGENCY: '加急',
  }
  return labels[urgency] || urgency
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    PLANNING: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    ON_HOLD: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
    PENDING: 'bg-gray-100 text-gray-600',
    BLOCKED: 'bg-red-100 text-red-700',
    SKIPPED: 'bg-gray-100 text-gray-400',
    NOT_PURCHASED: 'bg-gray-100 text-gray-600',
    ORDERED: 'bg-blue-100 text-blue-700',
    PURCHASED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    INSTALLED: 'bg-green-100 text-green-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

export function urgencyColor(urgency: string): string {
  const colors: Record<string, string> = {
    NORMAL: 'bg-gray-100 text-gray-600',
    TODO: 'bg-blue-100 text-blue-700',
    URGENT: 'bg-orange-100 text-orange-700',
    EMERGENCY: 'bg-red-100 text-red-700',
  }
  return colors[urgency] || 'bg-gray-100 text-gray-600'
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    HOMEOWNER: '业主',
    COMPANY: '装修公司',
    ADMIN: '管理员',
  }
  return labels[role] || role
}

export function calcProjectProgress(phases: Array<{ nodes: Array<{ status: string }> }>): number {
  const allNodes = phases.flatMap(p => p.nodes)
  if (allNodes.length === 0) return 0
  const completed = allNodes.filter(n => n.status === 'COMPLETED').length
  return Math.round((completed / allNodes.length) * 100)
}

export const ENTRY_TYPE_LABELS: Record<string, string> = {
  PHOTO: '照片记录',
  ISSUE: '问题记录',
  MATERIAL: '材料记录',
  DIALOGUE: '沟通记录',
  PROGRESS: '进度更新',
  INSPECTION: '验收记录',
}

export const ROLE_LABELS: Record<string, string> = {
  HOMEOWNER: '业主',
  COMPANY: '装修公司',
  ADMIN: '管理员',
}

// Legacy constants for backward compatibility with background-agent created files
export const STATUS_LABELS: Record<string, string> = {
  PENDING: '待开始',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  BLOCKED: '受阻',
  PLANNING: '规划中',
  ON_HOLD: '暂停',
  CANCELLED: '已取消',
  SKIPPED: '已跳过',
}

export const PHASE_LABELS: Record<string, string> = {
  PLANNING: '规划',
  DEMOLITION: '拆除',
  WATERPROOF: '防水',
  HYDROPOWER: '水电',
  TILING: '瓦工',
  CARPENTRY: '木工',
  PAINTING: '油漆',
  FURNITURE: '软装',
  COMPLETION: '竣工',
}

export const PHASES_ORDER = [
  'PLANNING', 'DEMOLITION', 'WATERPROOF', 'HYDROPOWER',
  'TILING', 'CARPENTRY', 'PAINTING', 'FURNITURE', 'COMPLETION'
]
