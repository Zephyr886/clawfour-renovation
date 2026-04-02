import Link from 'next/link'
import { getProjects } from '@/lib/data'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate, formatRelativeTime, calcProjectProgress, statusLabel } from '@/lib/utils'
import { Wrench, Package, ClipboardList, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CompanyPage() {
  let projects: any[] = []

  try {
    projects = await getProjects()
  } catch {
    // db not ready
  }

  const inProgressNodes = projects
    .flatMap((p: any) =>
      (p.phases || []).flatMap((ph: any) =>
        (ph.nodes || [])
          .filter((n: any) => n.status === 'IN_PROGRESS' || n.status === 'PENDING')
          .map((n: any) => ({ ...n, projectName: p.name, projectId: p.id, phaseName: ph.name }))
      )
    )
    .slice(0, 10)

  return (
    <AppLayout currentPath="/company">
      <PageHeader
        title="装修公司视角"
        description="以装修公司身份管理项目执行、节点更新与材料记录"
      />

      {/* Role Banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
        <Wrench size={20} className="text-purple-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-purple-700">装修公司视角 · 演示账号</p>
          <p className="text-xs text-purple-500">用户名: lijiasheng · 密码: demo123 · 角色: COMPANY</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-purple-500" />
                <CardTitle>执行中的项目</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {projects.length === 0 ? (
                <EmptyState icon="🔨" title="暂无项目" description="运行 db:seed 加载示例数据" className="py-10" />
              ) : (
                <div className="divide-y divide-gray-100">
                  {projects.slice(0, 4).map((project: any) => {
                    const progress = calcProjectProgress(project.phases || [])
                    const currentPhase = (project.phases || []).find((p: any) => p.status === 'IN_PROGRESS')
                    return (
                      <div key={project.id} className="px-6 py-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-xs text-gray-400">{project.address}</p>
                          </div>
                          <StatusBadge status={project.status} />
                        </div>
                        {currentPhase && (
                          <p className="text-xs text-blue-600 mb-2">当前阶段: {currentPhase.name}</p>
                        )}
                        <ProgressBar value={progress} showLabel className="mb-3" />
                        <Link
                          href={`/timeline/${project.id}`}
                          className="text-sm text-purple-500 hover:underline font-medium"
                        >
                          进入时间线管理 →
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Nodes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" />
                <CardTitle>待更新节点 ({inProgressNodes.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {inProgressNodes.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">所有节点已完成</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {inProgressNodes.map((node: any) => (
                    <div key={node.id} className="flex items-center gap-4 px-6 py-4">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${node.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{node.title}</p>
                        <p className="text-xs text-gray-400">{node.projectName} · {node.phaseName}</p>
                      </div>
                      <StatusBadge status={node.status} />
                      <Link
                        href={`/timeline/${node.projectId}/node/${node.id}`}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                      >
                        更新进度
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package size={16} className="text-orange-500" />
                <CardTitle>材料管理入口</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">从时间线节点进入材料管理，记录采购与到货状态</p>
              <Link
                href="/timeline"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                <Wrench size={15} />
                进入项目管理
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {[
                { href: '/timeline', label: '📅 项目时间线' },
                { href: '/dashboard', label: '📊 数据总览' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
