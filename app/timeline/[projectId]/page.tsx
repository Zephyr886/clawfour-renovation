import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectTimeline } from '@/lib/data'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { UrgencyBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate, calcProjectProgress, statusLabel, PHASE_LABELS } from '@/lib/utils'
import { ArrowLeft, ChevronRight, Package, MessageSquare, User, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProjectTimelinePage({
  params,
}: {
  params: { projectId: string }
}) {
  let project: any = null
  try {
    project = await getProjectTimeline(params.projectId)
  } catch {
    // db error
  }

  if (!project) {
    return notFound()
  }

  const overallProgress = calcProjectProgress(project.phases || [])
  const allNodes = (project.phases || []).flatMap((p: any) => p.nodes || [])
  const completedNodes = allNodes.filter((n: any) => n.status === 'COMPLETED').length
  const inProgressNodes = allNodes.filter((n: any) => n.status === 'IN_PROGRESS').length

  const phaseStatusColor: Record<string, string> = {
    PENDING: 'border-gray-200 bg-gray-50',
    IN_PROGRESS: 'border-blue-200 bg-blue-50',
    COMPLETED: 'border-green-200 bg-green-50',
    SKIPPED: 'border-gray-100 bg-gray-50',
  }

  const nodeStatusDot: Record<string, string> = {
    PENDING: 'bg-gray-300',
    IN_PROGRESS: 'bg-blue-500 animate-pulse',
    COMPLETED: 'bg-green-500',
    BLOCKED: 'bg-red-500',
  }

  return (
    <AppLayout currentPath="/timeline">
      {/* Back + Project Header */}
      <div className="mb-6">
        <Link
          href="/timeline"
          className="inline-flex items-center gap-1.5 text-sm text-textSecondary hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> 返回时间线列表
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">{project.name}</h1>
            {project.description && (
              <p className="text-textSecondary mt-1">{project.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-textSecondary">
              {project.address && <span>📍 {project.address}</span>}
              {project.startDate && <span>📅 {formatDate(project.startDate)}</span>}
              {project.owner && <span>👤 {project.owner.name || project.owner.username}</span>}
            </div>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={project.status} className="text-sm px-3 py-1" />
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            <div className="text-xs text-textSecondary mt-1">整体进度</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-success">{completedNodes}</div>
            <div className="text-xs text-textSecondary mt-1">已完成节点</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{inProgressNodes}</div>
            <div className="text-xs text-textSecondary mt-1">进行中节点</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall progress bar */}
      <div className="mb-8">
        <ProgressBar value={overallProgress} showLabel />
      </div>

      {/* Phase Timeline */}
      {(project.phases || []).length === 0 ? (
        <EmptyState icon="📋" title="暂无阶段数据" description="该项目还未配置装修阶段" />
      ) : (
        <div className="space-y-6">
          {(project.phases || []).map((phase: any, phaseIdx: number) => {
            const phaseNodes = phase.nodes || []
            const phaseCompleted = phaseNodes.filter((n: any) => n.status === 'COMPLETED').length
            const phaseProgress = phaseNodes.length > 0
              ? Math.round((phaseCompleted / phaseNodes.length) * 100)
              : 0
            const borderCls = phaseStatusColor[phase.status] || phaseStatusColor.PENDING

            return (
              <div key={phase.id} className={`rounded-xl border-2 ${borderCls} overflow-hidden`}>
                {/* Phase Header */}
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-sm font-bold text-textSecondary">
                      {phaseIdx + 1}
                    </div>
                    <div>
                      <h2 className="font-semibold text-text">
                        {phase.name}
                        {PHASE_LABELS[phase.phaseKey] && phase.name !== PHASE_LABELS[phase.phaseKey] && (
                          <span className="ml-2 text-xs font-normal text-textSecondary">
                            ({PHASE_LABELS[phase.phaseKey]})
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-textSecondary mt-0.5">
                        <StatusBadge status={phase.status} />
                        <span>{phaseCompleted}/{phaseNodes.length} 节点完成</span>
                        {phase.startDate && <span><Calendar size={11} className="inline mr-0.5" />{formatDate(phase.startDate)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="sm:w-40">
                    <ProgressBar value={phaseProgress} showLabel />
                  </div>
                </div>

                {/* Nodes */}
                {phaseNodes.length > 0 && (
                  <div className="border-t border-white/50 bg-white/60">
                    {phaseNodes.map((node: any) => (
                      <Link
                        key={node.id}
                        href={`/timeline/${project.id}/node/${node.id}`}
                        className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0 hover:bg-white/80 transition-colors group"
                      >
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${nodeStatusDot[node.status] || 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-text">{node.title}</span>
                            {node.urgency && node.urgency !== 'NORMAL' && (
                              <UrgencyBadge urgency={node.urgency} />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-textSecondary">
                            {node.assignee && (
                              <span className="flex items-center gap-1">
                                <User size={11} /> {node.assignee}
                              </span>
                            )}
                            {node.plannedDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {formatDate(node.plannedDate)}
                              </span>
                            )}
                            {node._count?.materials > 0 && (
                              <span className="flex items-center gap-1">
                                <Package size={11} /> {node._count.materials} 材料
                              </span>
                            )}
                            {node._count?.entries > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare size={11} /> {node._count.entries} 记录
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <StatusBadge status={node.status} />
                          <ChevronRight size={16} className="text-textSecondary group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {phaseNodes.length === 0 && (
                  <div className="px-5 py-4 text-center text-sm text-textSecondary bg-white/60 border-t border-white/50">
                    该阶段暂无节点
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
