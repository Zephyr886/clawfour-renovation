import { getProjects } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { formatDate, calcProjectProgress } from '@/lib/utils'
import Link from 'next/link'
import { Building2, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminTimelinesPage() {
  let projects: any[] = []
  try {
    projects = await getProjects()
  } catch {
    // db not ready
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text flex items-center gap-2">
          <Building2 className="h-6 w-6" /> 全部项目
        </h2>
        <p className="text-textSecondary mt-1">共 {projects.length} 个装修项目</p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-textSecondary">
            暂无项目数据，请运行 npm run db:seed 初始化示例数据
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project: any) => {
            const progress = calcProjectProgress(project.phases || [])
            const allNodes = (project.phases || []).flatMap((p: any) => p.nodes || [])
            const completedNodes = allNodes.filter((n: any) => n.status === 'COMPLETED').length

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text truncate">{project.name}</h3>
                      <p className="text-xs text-textSecondary mt-0.5">
                        业主: {project.owner?.name || project.owner?.username} · {project.address || '地址未填'}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-textSecondary mb-1">
                      <span>整体进度</span>
                      <span>{completedNodes}/{allNodes.length} 节点完成</span>
                    </div>
                    <ProgressBar value={progress} showLabel />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-textSecondary mb-4">
                    <div>
                      <div className="text-gray-400">开始时间</div>
                      <div className="font-medium text-gray-700">{formatDate(project.startDate)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">阶段数</div>
                      <div className="font-medium text-gray-700">{project.phases?.length || 0} 个</div>
                    </div>
                    <div>
                      <div className="text-gray-400">材料数</div>
                      <div className="font-medium text-gray-700">{project._count?.materials || 0} 项</div>
                    </div>
                  </div>
                  <Link
                    href={`/timeline/${project.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    查看时间线 <ArrowRight size={14} />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
