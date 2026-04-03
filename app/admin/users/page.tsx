import { getUsers } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { UserManager } from '@/components/admin/user-manager'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  let users: any[] = []
  try {
    users = await getUsers()
  } catch {
    // db not ready
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text flex items-center gap-2">
          <Users className="h-6 w-6" /> 用户管理
        </h2>
        <p className="text-textSecondary mt-1">共 {users.length} 位注册用户 · 可编辑角色、信息与启停用状态</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="p-8 text-center text-textSecondary">暂无用户数据，请运行 npm run db:seed</div>
          ) : (
            <UserManager users={users} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
