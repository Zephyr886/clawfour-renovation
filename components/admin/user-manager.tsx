'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Loader2, UserX, UserCheck } from 'lucide-react'
import { formatDate, roleLabel } from '@/lib/utils'

interface User {
  id: string
  username: string
  name?: string
  role: string
  email?: string
  phone?: string
  isDisabled: boolean
  createdAt: string
}

interface UserManagerProps {
  users: User[]
}

const roleColor: Record<string, string> = {
  ADMIN: 'bg-amber-100 text-amber-700',
  COMPANY: 'bg-purple-100 text-purple-700',
  HOMEOWNER: 'bg-blue-100 text-blue-700',
}

interface EditUserFormProps {
  user: User
  onSuccess: () => void
  onCancel: () => void
}

function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user.name || '',
    role: user.role,
    email: user.email || '',
    phone: user.phone || '',
    isDisabled: user.isDisabled,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '更新失败')
      onSuccess()
    } catch (err: any) {
      setError(err.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-amber-50/50 rounded-lg border border-amber-100">
      <h4 className="text-sm font-semibold text-gray-700">编辑用户: {user.username}</h4>
      {error && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">姓名</Label>
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">角色</Label>
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white"
          >
            <option value="HOMEOWNER">业主 (HOMEOWNER)</option>
            <option value="COMPANY">装修公司 (COMPANY)</option>
            <option value="ADMIN">管理员 (ADMIN)</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">邮箱</Label>
          <Input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">手机</Label>
          <Input
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isDisabled"
            checked={form.isDisabled}
            onChange={e => setForm(f => ({ ...f, isDisabled: e.target.checked }))}
            className="rounded"
          />
          <Label htmlFor="isDisabled" className="text-sm cursor-pointer text-red-600">禁用该账号</Label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>取消</Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading && <Loader2 size={12} className="animate-spin mr-1" />}
          保存
        </Button>
      </div>
    </form>
  )
}

export function UserManager({ users: initialUsers }: UserManagerProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleToggleDisabled = async (user: User) => {
    if (!confirm(`确认${user.isDisabled ? '启用' : '禁用'}用户「${user.username}」？`)) return
    setTogglingId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisabled: !user.isDisabled }),
      })
      if (res.ok) {
        setUsers(us => us.map(u => u.id === user.id ? { ...u, isDisabled: !u.isDisabled } : u))
      }
    } finally {
      setTogglingId(null)
    }
  }

  const handleEditSuccess = () => {
    setEditingId(null)
    router.refresh()
  }

  return (
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
            <th className="px-4 py-3 font-medium text-textSecondary">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <>
              <tr key={user.id} className={`border-b hover:bg-surface/50 ${user.isDisabled ? 'opacity-60' : ''}`}>
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleDisabled(user)}
                      disabled={togglingId === user.id}
                      className={`p-1.5 rounded transition-colors ${user.isDisabled ? 'text-gray-400 hover:text-green-500 hover:bg-green-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                      title={user.isDisabled ? '启用账号' : '禁用账号'}
                    >
                      {togglingId === user.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : user.isDisabled ? (
                        <UserCheck size={14} />
                      ) : (
                        <UserX size={14} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
              {editingId === user.id && (
                <tr key={`edit-${user.id}`}>
                  <td colSpan={7} className="px-4 py-3">
                    <EditUserForm
                      user={user}
                      onSuccess={handleEditSuccess}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
