import { Navbar } from './navbar'
import type { SessionUser } from '@/types'

interface AppLayoutProps {
  children: React.ReactNode
  user?: SessionUser | null
  currentPath?: string
}

export function AppLayout({ children, user, currentPath }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={user} currentPath={currentPath} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
