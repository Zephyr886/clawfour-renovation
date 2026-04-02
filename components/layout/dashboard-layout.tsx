"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Home, LogOut, Menu, User as UserIcon, Building2, ShieldCheck, ChevronRight, MenuSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROLE_LABELS } from '@/lib/utils'

interface User {
  id: string
  username: string
  role: string
  name: string | null
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setUser(data.data)
        } else {
          router.push('/login')
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-textSecondary">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const getNavLinks = () => {
    switch (user.role) {
      case 'HOMEOWNER':
        return [
          { href: '/homeowner', label: '我的项目', icon: Home },
        ]
      case 'COMPANY':
        return [
          { href: '/company', label: '项目管理', icon: Building2 },
        ]
      case 'ADMIN':
        return [
          { href: '/admin', label: '系统总览', icon: ShieldCheck },
          { href: '/admin/users', label: '用户管理', icon: UserIcon },
          { href: '/admin/timelines', label: '全部项目', icon: MenuSquare },
        ]
      default:
        return []
    }
  }

  const links = getNavLinks()
  const roleColor = user.role === 'HOMEOWNER' ? 'bg-primary' : user.role === 'COMPANY' ? 'bg-secondary' : 'bg-warning'

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary text-xl">
            <Home className="h-6 w-6" />
            Clawfour
          </Link>
          <button 
            className="ml-auto lg:hidden text-textSecondary hover:text-text"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-6 rounded-lg bg-surface p-4 border flex flex-col items-center text-center">
            <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full text-white text-xl font-bold ${roleColor}`}>
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="font-medium text-text">{user.name || user.username}</div>
            <div className="text-xs text-textSecondary flex items-center gap-1 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${roleColor}`}></span>
              {ROLE_LABELS[user.role] || user.role}
            </div>
          </div>
          
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-textSecondary hover:bg-surface hover:text-text'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  {link.label}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full border-t p-4 bg-white">
          <Button 
            variant="outline" 
            className="w-full justify-start text-error hover:text-error hover:bg-error/10 border-error/20" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 rounded-md p-2 text-textSecondary hover:bg-surface lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-text truncate">
              {links.find(l => pathname === l.href || pathname.startsWith(l.href + '/'))?.label || '控制台'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium">{user.name || user.username}</span>
              <span className="text-xs text-textSecondary">{ROLE_LABELS[user.role]}</span>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white font-medium ${roleColor}`}>
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
