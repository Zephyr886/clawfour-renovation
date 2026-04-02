import { getUsers } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, roleLabel } from '@/lib/utils'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  let users: any[] = []
  try {
    users = await getUsers()
  } catch {
    // db not ready
  }

  const roleColor: Record<string, string> = {
    ADMIN: 'bg-amber-100 text-amber-700',
    COMPANY: 'bg-purple-100 text-purple-700',
    HOMEOWNER: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text flex items-center gap-2">
          <Users className="h-6 w-6" /> 用户管理
        </h2>
        <p className="text-textSecondary mt-1">共 {users.length} 位注册用户</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="p-8 text-center text-textSecondary">暂无用户数据，请运行 npm run db:seed</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-surface text-left">
                    <th className="px-4 py-3 font-medium text-textSecondary">用户名</th>
                    <th className="px-4 py-3 font-medium text-textSecondary">姓名</th>
                    <th className="px-4 py-3 font-medium text-textSecondary">角色</th>
                    <th className="px-4 py-3 font-medium text-textSecondary">邮箱</th>
                    <th className="px-4 py-3 font-medium text-textSecondary">注册时间</th>
                    <th className="px-4 py-3 font-medium text-textSecondary">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-surface/50">
                      <td className="px-4 py-3 font-mono text-xs font-medium">{user.username}</td>
                      <td className="px-4 py-3">{user.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[user.role] || 'bg-gray-100 text-gray-600'}`}>
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-textSecondary">{user.email || '-'}</td>
                      <td className="px-4 py-3 text-textSecondary">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.isDisabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {user.isDisabled ? '已禁用' : '正常'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
