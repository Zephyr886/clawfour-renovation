import Link from 'next/link'
import { Home, LayoutDashboard, Clock, Users, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SessionUser } from '@/types'
import { UserNav } from './user-nav'

interface NavbarProps {
  user?: SessionUser | null
  currentPath?: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/timeline', label: '时间线', icon: Clock },
  { href: '/homeowner', label: '业主视角', icon: Home, roles: ['HOMEOWNER', 'ADMIN'] },
  { href: '/company', label: '公司视角', icon: Wrench, roles: ['COMPANY', 'ADMIN'] },
  { href: '/admin', label: '管理', icon: Users, roles: ['ADMIN'] },
]

export function Navbar({ user, currentPath = '' }: NavbarProps) {
  const visibleItems = navItems.filter(
    item => !item.roles || !user || item.roles.includes(user.role)
  )

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
            <span className="text-xl">🏠</span>
            <span className="hidden sm:block text-blue-600 font-bold">爪四装修</span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {visibleItems.map(item => {
              const Icon = item.icon
              const isActive = currentPath.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden md:block">{item.label}</span>
                </Link>
              )
            })}
          </div>

          <UserNav initialUser={user} />
        </div>
      </div>
    </nav>
  )
}
