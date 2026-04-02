import Link from 'next/link'
import { getProjects, getActivities } from '@/lib/data'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate, formatRelativeTime, calcProjectProgress } from '@/lib/utils'
import { Home, Clock, MessageSquare, Package, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomeownerPage() {
  let projects: any[] = []
  let activities: any[] = []

  try {
    projects = await getProjects()
    activities = await getActivities(undefined, 15)
  } catch {
    // db not ready
  }

  const activeProjects = projects.filter((p: any) => p.status === 'IN_PROGRESS')
  const urgentNodes = projects
    .flatMap((p: any) => (p.phases || []).flatMap((ph: any) => (ph.nodes || []).map((n: any) => ({ ...n, projectName: p.name, projectId: p.id }))))
    .filter((n: any) => n.urgency === 'URGENT' || n.urgency === 'EMERGENCY')
    .slice(0, 5)

  return (
    <AppLayout currentPath="/homeowner">
      <PageHeader
        title="业主视角"
        description="以业主身份查看项目进展、沟通记录与材料状态"
      />

      {/* Role Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
        <Home size={20} className="text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-700">业主视角 · 演示账号</p>
          <p className="text-xs text-blue-500">用户名: zhang_ming · 密码: demo123 · 角色: HOMEOWNER</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Projects */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>我的装修项目 ({activeProjects.length} 进行中)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {projects.length === 0 ? (
                <EmptyState icon="🏠" title="暂无项目" description="运行 db:seed 加载示例数据" className="py-10" />
              ) : (
                <div className="divide-y divide-gray-100">
                  {projects.slice(0, 5).map((project: any) => {
                    const progress = calcProjectProgress(project.phases || [])
                    const allNodes = (project.phases || []).flatMap((p: any) => p.nodes || [])
                    const pendingNodes = allNodes.filter((n: any) => n.status === 'PENDING' || n.status === 'IN_PROGRESS').length
                    return (
                      <div key={project.id} className="px-6 py-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{project.address || '地址未填'} · {formatDate(project.startDate)}</p>
                          </div>
                          <StatusBadge status={project.status} />
                        </div>
                        <ProgressBar value={progress} showLabel className="mb-3" />
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={12} />{pendingNodes} 个节点进行中</span>
                          <span className="flex items-center gap-1"><Package size={12} />{project._count?.materials || 0} 项材料</span>
                        </div>
                        <Link
                          href={`/timeline/${project.id}`}
                          className="mt-3 inline-flex items-center text-sm text-blue-500 hover:underline font-medium"
                        >
                          查看完整时间线 →
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgent Nodes */}
          {urgentNodes.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <CardTitle>需要关注的节点</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {urgentNodes.map((node: any) => (
                  <div key={node.id} className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{node.title}</p>
                      <p className="text-xs text-gray-400">{node.projectName}</p>
                    </div>
                    <StatusBadge status={node.status} />
                    <Link href={`/timeline/${node.projectId}/node/${node.id}`} className="text-xs text-blue-500 hover:underline whitespace-nowrap">
                      查看 →
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Activity */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-green-500" />
                <CardTitle>最新动态</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {activities.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">暂无动态</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {activities.map((log: any) => (
                    <div key={log.id} className="px-4 py-3">
                      <p className="text-sm text-gray-700">{log.description || `${log.entityType} ${log.action}`}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{log.user?.name || log.user?.username}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(log.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
