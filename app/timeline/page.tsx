import Link from 'next/link'
import { getProjects } from '@/lib/data'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate, calcProjectProgress } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TimelineListPage() {
  let projects: any[] = []
  try {
    projects = await getProjects()
  } catch {
    // db not ready
  }

  return (
    <AppLayout currentPath="/timeline">
      <PageHeader
        title="项目时间线"
        description="所有装修项目的时间线概览"
      />

      {projects.length === 0 ? (
        <EmptyState
          icon="📅"
          title="暂无项目"
          description="运行 npm run db:seed 初始化示例数据后即可看到项目"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project: any) => {
            const progress = calcProjectProgress(project.phases || [])
            const allNodes = (project.phases || []).flatMap((p: any) => p.nodes || [])
            const completedNodes = allNodes.filter((n: any) => n.status === 'COMPLETED').length

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base truncate">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                    <StatusBadge status={project.status} />
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>整体进度</span>
                      <span>{completedNodes}/{allNodes.length} 节点完成</span>
                    </div>
                    <ProgressBar value={progress} showLabel />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
                    <div>
                      <div className="text-gray-400">地址</div>
                      <div className="font-medium text-gray-700 truncate">{project.address || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">开始</div>
                      <div className="font-medium text-gray-700">{formatDate(project.startDate)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">阶段</div>
                      <div className="font-medium text-gray-700">{project.phases?.length || 0} 个</div>
                    </div>
                  </div>

                  <Link
                    href={`/timeline/${project.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    查看完整时间线 <ArrowRight size={15} />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
