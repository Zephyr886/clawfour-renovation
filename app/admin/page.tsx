import { getUsers, getProjects, getActivities } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Users, Building2, Activity, Settings, ListTodo } from 'lucide-react'
import { formatDateTime, formatRelativeTime, roleLabel } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  let users: any[] = []
  let projects: any[] = []
  let logs: any[] = []

  try {
    ;[users, projects, logs] = await Promise.all([
      getUsers(),
      getProjects(),
      getActivities(undefined, 10),
    ])
  } catch {
    // db not ready
  }

  const activeProjects = projects.filter((p: any) => !p.isArchived)
  const todayLogs = logs.filter((l: any) => new Date(l.createdAt).toDateString() === new Date().toDateString())

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-warning" /> 平台总览
        </h2>
        <p className="text-textSecondary mt-2">监控系统运行状态、用户活动与项目全局进度。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-warning shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">注册用户</CardTitle>
            <Users className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{users.length}</div>
            <p className="text-xs text-textSecondary mt-1">系统所有角色用户总数</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">项目总数</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{projects.length}</div>
            <p className="text-xs text-textSecondary mt-1">包含已归档的历史项目</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-success shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">活跃项目</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{activeProjects.length}</div>
            <p className="text-xs text-textSecondary mt-1">当前正在进行中的项目</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-secondary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日动态</CardTitle>
            <ListTodo className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text">{todayLogs.length}</div>
            <p className="text-xs text-textSecondary mt-1">今日系统内产生的操作记录</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border">
          <CardHeader className="bg-surface/50 border-b pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><Settings className="h-5 w-5" /> 快捷管理</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <Link href="/admin/users" className="flex items-center justify-between p-4 hover:bg-surface transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg"><Users className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h4 className="font-medium text-text">用户与权限</h4>
                    <p className="text-xs text-textSecondary">管理系统登录账号与角色</p>
                  </div>
                </div>
              </Link>
              <Link href="/admin/timelines" className="flex items-center justify-between p-4 hover:bg-surface transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-lg"><Building2 className="h-5 w-5 text-secondary" /></div>
                  <div>
                    <h4 className="font-medium text-text">所有项目</h4>
                    <p className="text-xs text-textSecondary">查看和管理平台上的全部装修项目</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border">
          <CardHeader className="bg-surface/50 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" /> 最新系统日志
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-textSecondary">暂无操作记录</div>
              ) : (
                logs.map((log: any) => (
                  <div key={log.id} className="p-4 flex gap-4">
                    <div className="mt-0.5">
                      <div className={`h-2 w-2 rounded-full mt-1.5 ${log.action === 'CREATE' || log.action === 'CREATED' ? 'bg-success' : log.action === 'UPDATE' || log.action === 'UPDATED' ? 'bg-primary' : 'bg-error'}`} />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium text-text">
                        {log.user?.name || log.user?.username} — {log.description || `${log.action} ${log.entityType}`}
                      </p>
                      {log.project && (
                        <p className="text-xs text-textSecondary">项目: {log.project.name}</p>
                      )}
                      <p className="text-xs text-textSecondary">{formatRelativeTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User summary */}
      <Card>
        <CardHeader>
          <CardTitle>用户角色分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {['HOMEOWNER', 'COMPANY', 'ADMIN'].map(role => {
              const count = users.filter((u: any) => u.role === role).length
              return (
                <div key={role} className="text-center p-4 rounded-lg bg-surface">
                  <div className="text-2xl font-bold text-text">{count}</div>
                  <div className="text-sm text-textSecondary mt-1">{roleLabel(role)}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
