import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getNodeById } from '@/lib/data'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge, UrgencyBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDate, formatDateTime, formatRelativeTime, statusLabel, urgencyLabel, ENTRY_TYPE_LABELS, parseJsonArray } from '@/lib/utils'
import { ArrowLeft, Calendar, User, Package, MessageSquare, BarChart2, Clock, AlertCircle } from 'lucide-react'
import { NodeCommentForm } from '@/components/nodes/node-comment-section'
import { getCurrentAuthUser } from '@/lib/session'
import { NodesManager } from '@/components/timeline/nodes-manager'
import { ProgressFormSection } from '@/components/nodes/progress-form-section'
import { WorkEntryForm } from '@/components/nodes/work-entry-form'
import { MaterialList } from '@/components/materials/material-list'

export const dynamic = 'force-dynamic'

export default async function NodeDetailPage({
  params,
}: {
  params: { projectId: string; nodeId: string }
}) {
  const user = await getCurrentAuthUser()
  let node: any = null
  try {
    node = await getNodeById(params.nodeId, user)
  } catch {
    // db error
  }

  if (!node) return notFound()

  const project = node.phase?.project
  const latestProgress = node.progressRecords?.[0]

  return (
    <AppLayout user={user} currentPath="/timeline">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href={`/timeline/${params.projectId}`}
          className="inline-flex items-center gap-1.5 text-sm text-textSecondary hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> 返回 {project?.name || '项目时间线'}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-textSecondary mb-2">
              <span>{project?.name}</span>
              <span>›</span>
              <span>{node.phase?.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-text">{node.title}</h1>
            {node.description && (
              <p className="text-textSecondary mt-2">{node.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={node.status} className="text-sm" />
            {node.urgency !== 'NORMAL' && <UrgencyBadge urgency={node.urgency} className="text-sm" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">节点基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-textSecondary mb-1">状态</div>
                  <StatusBadge status={node.status} />
                </div>
                <div>
                  <div className="text-xs text-textSecondary mb-1">紧急程度</div>
                  <UrgencyBadge urgency={node.urgency} />
                </div>
                <div>
                  <div className="text-xs text-textSecondary mb-1 flex items-center gap-1"><User size={11} />负责人</div>
                  <div className="font-medium text-text">{node.assignee || '未分配'}</div>
                  <div className="text-xs text-textSecondary mt-1">可在下方节点管理区更新负责人、状态、日期和阶段</div>
                </div>
                <div>
                  <div className="text-xs text-textSecondary mb-1 flex items-center gap-1"><User size={11} />创建人</div>
                  <div className="font-medium text-text">{node.creator?.name || node.creator?.username || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-textSecondary mb-1 flex items-center gap-1"><Calendar size={11} />计划日期</div>
                  <div className="font-medium text-text">{formatDate(node.plannedDate)}</div>
                </div>
                <div>
                  <div className="text-xs text-textSecondary mb-1 flex items-center gap-1"><Calendar size={11} />实际日期</div>
                  <div className="font-medium text-text">{formatDate(node.actualDate)}</div>
                </div>
                <div>
                  <div className="text-xs text-textSecondary mb-1 flex items-center gap-1"><Clock size={11} />创建时间</div>
                  <div className="font-medium text-text">{formatDateTime(node.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-textSecondary mb-1 flex items-center gap-1"><Clock size={11} />更新时间</div>
                  <div className="font-medium text-text">{formatDateTime(node.updatedAt)}</div>
                </div>
              </div>

              {/* Current Progress */}
              {latestProgress && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-textSecondary mb-2 flex items-center gap-1">
                    <BarChart2 size={11} /> 当前进度
                  </div>
                  <ProgressBar value={latestProgress.percentage} showLabel />
                  {latestProgress.note && (
                    <p className="text-xs text-textSecondary mt-2 italic">{latestProgress.note}</p>
                  )}
                  <p className="text-xs text-textSecondary mt-1">
                    由 {latestProgress.recorder?.name || latestProgress.recorder?.username} 于 {formatRelativeTime(latestProgress.recordedAt)} 更新
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" />
                <CardTitle className="text-base">评论 ({(node.nodeComments || []).length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {(node.nodeComments || []).length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <EmptyState icon="💬" title="暂无评论" description="发表第一条评论" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {node.nodeComments.map((comment: any) => (
                    <div key={comment.id} className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {(comment.user?.name || comment.user?.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-text">
                          {comment.user?.name || comment.user?.username}
                        </span>
                        <span className="text-xs text-textSecondary">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-text leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-gray-100 px-6 py-4">
                <NodeCommentForm nodeId={node.id} projectId={params.projectId} />
              </div>
            </CardContent>
          </Card>

          {/* NodeEntries / Work Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">工作记录 ({(node.entries || []).length})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Work Entry Form - only for non-homeowner */}
              {user && user.role !== 'HOMEOWNER' && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-xs text-textSecondary mb-3">新增工作记录</p>
                  <WorkEntryForm nodeId={node.id} />
                </div>
              )}
              {(node.entries || []).length === 0 ? (
                <div className="text-center py-6 text-textSecondary text-sm">暂无工作记录</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {node.entries.map((entry: any) => (
                    <div key={entry.id} className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              {ENTRY_TYPE_LABELS[entry.type] || entry.type}
                            </span>
                            <span className="text-sm font-medium text-text">{entry.title}</span>
                          </div>
                          {entry.content && (
                            <p className="text-sm text-textSecondary">{entry.content}</p>
                          )}
                          <p className="text-xs text-textSecondary mt-1">
                            {entry.creator?.name || entry.creator?.username} · {formatRelativeTime(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Progress Recording */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-success" />
                <CardTitle className="text-base">进度记录</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ProgressFormSection nodeId={node.id} projectId={params.projectId} />
            </CardContent>
          </Card>

          {/* Progress History */}
          {(node.progressRecords || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">进度历史</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {node.progressRecords.slice(0, 5).map((record: any) => (
                    <div key={record.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-success">{record.percentage}%</span>
                        <span className="text-xs text-textSecondary">{formatRelativeTime(record.recordedAt)}</span>
                      </div>
                      {record.note && <p className="text-xs text-textSecondary">{record.note}</p>}
                      <p className="text-xs text-textSecondary mt-0.5">
                        {record.recorder?.name || record.recorder?.username}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Materials */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package size={16} className="text-warning" />
                <CardTitle className="text-base">相关材料</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <MaterialList
                materials={node.materials || []}
                projectId={params.projectId}
                nodeId={node.id}
                userRole={user?.role || 'HOMEOWNER'}
              />
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">节点管理</CardTitle>
            </CardHeader>
            <CardContent>
              <NodesManager projectId={params.projectId} phases={[{ ...node.phase, nodes: [node] }]} user={user} />
            </CardContent>
          </Card>

          {(node.activityLogs || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">操作日志</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {node.activityLogs.slice(0, 8).map((log: any) => (
                    <div key={log.id} className="px-4 py-2.5">
                      <p className="text-xs text-text">{log.description || `${log.action} ${log.entityType}`}</p>
                      <p className="text-xs text-textSecondary mt-0.5">
                        {log.user?.name || log.user?.username} · {formatRelativeTime(log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
