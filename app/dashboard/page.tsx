import { getDashboardStats, getProjects, getActivities } from '@/lib/data'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { EmptyState } from '@/components/shared/empty-state'
import { StatCard } from '@/components/shared/stat-card'
import { formatDate, formatRelativeTime, calcProjectProgress } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { BarChart3, FolderOpen, CheckSquare, Clock, Activity, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  let stats = {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalNodes: 0,
    pendingNodes: 0,
    completedNodes: 0,
    inProgressNodes: 0,
  }
  let projects: any[] = []
  let activities: any[] = []

  try {
    [stats, projects, activities] = await Promise.all([
      getDashboardStats(user?.id, user?.role),
      getProjects(user?.id, user?.role),
      getActivities(undefined, 10),
    ])
  } catch {
    // db not ready — show empty state
  }

  return (
    <AppLayout currentPath="/dashboard">
      <PageHeader
        title="Dashboard 总览"
        description={user ? `欢迎回来，${user.name || user.username}` : '装修项目数据总览'}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="项目总数"
          value={stats.totalProjects}
          icon={<FolderOpen className="h-5 w-5" />}
          color="primary"
          subtitle={`${stats.activeProjects} 个进行中`}
        />
        <StatCard
          title="节点总数"
          value={stats.totalNodes}
          icon={<CheckSquare className="h-5 w-5" />}
          color="secondary"
          subtitle={`${stats.completedNodes} 个已完成`}
        />
        <StatCard
          title="待处理节点"
          value={stats.pendingNodes}
          icon={<Clock className="h-5 w-5" />}
          color="warning"
          subtitle="待开始或进行中"
        />
        <StatCard
          title="已完成项目"
          value={stats.completedProjects}
          icon={<BarChart3 className="h-5 w-5" />}
          color="success"
          subtitle="历史竣工项目"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>项目列表</CardTitle>
              <Link href="/timeline" className="text-sm text-primary hover:underline flex items-center gap-1">
                查看全部 <ArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {projects.length === 0 ? (
                <EmptyState
                  icon="📁"
                  title="暂无项目数据"
                  description="运行 npm run db:seed 初始化示例数据"
                  className="py-12"
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {projects.slice(0, 6).map((project: any) => {
                    const progress = calcProjectProgress(project.phases || [])
                    const allNodes = (project.phases || []).flatMap((p: any) => p.nodes || [])
                    const completedCount = allNodes.filter((n: any) => n.status === 'COMPLETED').length
                    return (
                      <div key={project.id} className="px-6 py-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <h3 className="font-medium text-text truncate">{project.name}</h3>
                            <p className="text-xs text-textSecondary mt-0.5">{project.address || '地址未填'} · {formatDate(project.startDate)}</p>
                          </div>
                          <StatusBadge status={project.status} />
                        </div>
                        <ProgressBar value={progress} showLabel className="mb-2" />
                        <div className="flex items-center justify-between text-xs text-textSecondary">
                          <span>{completedCount}/{allNodes.length} 节点完成</span>
                          <Link href={`/timeline/${project.id}`} className="text-primary hover:underline">
                            查看时间线 →
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-success" />
                <CardTitle>最新动态</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {activities.length === 0 ? (
                <div className="px-4 py-10 text-center text-textSecondary text-sm">暂无操作记录</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {activities.map((log: any) => (
                    <div key={log.id} className="px-4 py-3">
                      <p className="text-sm text-text">{log.description || `${log.entityType} ${log.action}`}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-textSecondary">{log.user?.name || log.user?.username}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-textSecondary">{formatRelativeTime(log.createdAt)}</span>
                        {log.project && (
                          <>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-textSecondary truncate">{log.project.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role links */}
          {user && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>快捷入口</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {[
                  { href: '/timeline', label: '📅 项目时间线' },
                  user.role !== 'HOMEOWNER' ? { href: '/company', label: '🔨 公司视角' } : null,
                  user.role === 'ADMIN' ? { href: '/admin', label: '🛡️ 管理后台' } : null,
                  { href: '/homeowner', label: '🏠 业主视角' },
                ].filter(Boolean).map((link: any) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm text-textSecondary hover:bg-surface hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
