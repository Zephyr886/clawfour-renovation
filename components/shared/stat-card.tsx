import { cn } from '@/lib/utils'

type ColorKey = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray'

interface StatCardProps {
  // New API (title/subtitle)
  title?: string
  subtitle?: string
  // Legacy API (label/description)
  label?: string
  description?: string
  value: string | number
  icon?: React.ReactNode
  color?: ColorKey
  className?: string
}

const colorStyles: Record<string, { icon: string; value: string }> = {
  primary: { icon: 'bg-blue-50 text-[#3B82F6]', value: 'text-[#3B82F6]' },
  secondary: { icon: 'bg-purple-50 text-[#8B5CF6]', value: 'text-[#8B5CF6]' },
  success: { icon: 'bg-green-50 text-[#10B981]', value: 'text-[#10B981]' },
  warning: { icon: 'bg-yellow-50 text-[#F59E0B]', value: 'text-[#F59E0B]' },
  error: { icon: 'bg-red-50 text-[#EF4444]', value: 'text-[#EF4444]' },
  blue: { icon: 'bg-blue-50 text-[#3B82F6]', value: 'text-[#3B82F6]' },
  green: { icon: 'bg-green-50 text-[#10B981]', value: 'text-[#10B981]' },
  yellow: { icon: 'bg-yellow-50 text-[#F59E0B]', value: 'text-[#F59E0B]' },
  purple: { icon: 'bg-purple-50 text-[#8B5CF6]', value: 'text-[#8B5CF6]' },
  red: { icon: 'bg-red-50 text-[#EF4444]', value: 'text-[#EF4444]' },
  gray: { icon: 'bg-gray-50 text-gray-500', value: 'text-gray-700' },
}

export function StatCard({
  title,
  subtitle,
  label,
  description,
  value,
  icon,
  color = 'primary',
  className,
}: StatCardProps) {
  const styles = colorStyles[color] || colorStyles.primary
  const heading = title || label || ''
  const subtext = subtitle || description

  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 shadow-sm p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium truncate">{heading}</p>
          <p className={cn('text-3xl font-bold mt-1', styles.value)}>{value}</p>
          {subtext && (
            <p className="text-xs text-gray-400 mt-1">{subtext}</p>
          )}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ml-3', styles.icon)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
