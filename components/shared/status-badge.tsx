import { cn, statusColor, statusLabel, urgencyColor, urgencyLabel } from '@/lib/utils'

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusColor(status), className)}>
      {statusLabel(status)}
    </span>
  )
}

export function UrgencyBadge({ urgency, className }: { urgency: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', urgencyColor(urgency), className)}>
      {urgencyLabel(urgency)}
    </span>
  )
}
