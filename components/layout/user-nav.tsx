'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { roleLabel } from '@/lib/utils'
import type { SessionUser } from '@/types'

export function UserNav({ initialUser }: { initialUser?: SessionUser | null }) {
  const [user, setUser] = useState<SessionUser | null>(initialUser ?? null)
  const [loading, setLoading] = useState(!initialUser)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!res.ok) {
          if (!cancelled) setUser(null)
          return
        }
        const data = await res.json()
        if (!cancelled) setUser(data.data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading && !user) {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-surface" />
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-colors"
      >
        登录
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
          {(user.name || user.username).charAt(0).toUpperCase()}
        </div>
        <div className="text-xs">
          <div className="font-medium text-text">{user.name || user.username}</div>
          <div className="text-textSecondary">{roleLabel(user.role)}</div>
        </div>
      </div>
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="p-2 rounded-lg text-textSecondary hover:text-error hover:bg-red-50 transition-colors"
          title="退出登录"
        >
          <LogOut size={16} />
        </button>
      </form>
    </div>
  )
}
