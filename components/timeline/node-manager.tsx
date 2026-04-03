'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronUp, User } from 'lucide-react'

interface User {
  id: string
  name?: string
  username: string
  role: string
}

interface NodeManagerProps {
  projectId: string
  phases: Array<{
    id: string
    name: string
    nodes: Array<{
      id: string
      title: string
      status: string
      assignee?: string
      plannedDate?: string
      order: number
    }>
  }>
  userRole: string
  availableUsers?: User[]
}

const NODE_STATUSES = [
  { value: 'PENDING', label: '待开始', color: 'text-gray-600' },
  { value: 'IN_PROGRESS', label: '进行中', color: 'text-blue-600' },
  { value: 'COMPLETED', label: '已完成', color: 'text-green-600' },
  { value: 'BLOCKED', label: '已阻塞', color: 'text-red-600' },
]

interface AddNodeFormProps {
  phaseId: string
  projectId: string
  users: User[]
  onSuccess: () => void
  onCancel: () => void
}

function AddNodeForm({ phaseId, projectId, users, onSuccess, onCancel }: AddNodeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    urgency: 'NORMAL',
    assignee: '',
    plannedDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('节点名称不能为空')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/timelines/${projectId}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          urgency: form.urgency,
          assignee: form.assignee.trim() || undefined,
          plannedDate: form.plannedDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '创建失败')
      onSuccess()
    } catch (err: any) {
      setError(err.message || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
      <h4 className="text-sm font-medium text-gray-700">新增节点</h4>
      {error && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{error}</div>}
      <div>
        <Label htmlFor="node-title" className="text-xs">节点名称 *</Label>
        <Input
          id="node-title"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="例如：铺设瓷砖"
          className="mt-1 h-8 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="node-urgency" className="text-xs">紧急程度</Label>
          <select
            id="node-urgency"
            value={form.urgency}
            onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
            className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white"
          >
            <option value="NORMAL">普通</option>
            <option value="TODO">待办</option>
            <option value="URGENT">紧急</option>
            <option value="EMERGENCY">特急</option>
          </select>
        </div>
        <div>
          <Label htmlFor="node-date" className="text-xs">计划日期</Label>
          <Input
            id="node-date"
            type="date"
            value={form.plannedDate}
            onChange={e => setForm(f => ({ ...f, plannedDate: e.target.value }))}
            className="mt-1 h-8 text-sm"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="node-assignee" className="text-xs">负责人</Label>
        <select
          id="node-assignee"
          value={form.assignee}
          onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
          className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white"
        >
          <option value="">未分配</option>
          {users.map(u => (
            <option key={u.id} value={u.name || u.username}>{u.name || u.username} ({u.role})</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="node-desc" className="text-xs">描述</Label>
        <textarea
          id="node-desc"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="可选"
          rows={2}
          className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>取消</Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? <Loader2 size={12} className="animate-spin mr-1" /> : <Plus size={12} className="mr-1" />}
          创建节点
        </Button>
      </div>
    </form>
  )
}

interface EditNodeFormProps {
  node: { id: string; title: string; status: string; assignee?: string; plannedDate?: string }
  users: User[]
  onSuccess: () => void
  onCancel: () => void
}

function EditNodeForm({ node, users, onSuccess, onCancel }: EditNodeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: node.title,
    status: node.status,
    assignee: node.assignee || '',
    plannedDate: node.plannedDate ? node.plannedDate.split('T')[0] : '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('节点名称不能为空')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/nodes/${node.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          status: form.status,
          assignee: form.assignee.trim() || null,
          plannedDate: form.plannedDate || null,
        }),
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
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
      {error && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{error}</div>}
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Label className="text-xs">节点名称</Label>
          <Input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">状态</Label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white"
          >
            {NODE_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">计划日期</Label>
          <Input
            type="date"
            value={form.plannedDate}
            onChange={e => setForm(f => ({ ...f, plannedDate: e.target.value }))}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">负责人</Label>
          <select
            value={form.assignee}
            onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
            className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white"
          >
            <option value="">未分配</option>
            {users.map(u => (
              <option key={u.id} value={u.name || u.username}>{u.name || u.username}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>取消</Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
          保存
        </Button>
      </div>
    </form>
  )
}

export function NodeManager({ projectId, phases: initialPhases, userRole, availableUsers = [] }: NodeManagerProps) {
  const router = useRouter()
  const canEdit = userRole !== 'HOMEOWNER'
  const [addingToPhase, setAddingToPhase] = useState<string | null>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [deletingNode, setDeletingNode] = useState<string | null>(null)

  const handleAddSuccess = () => {
    setAddingToPhase(null)
    router.refresh()
  }

  const handleEditSuccess = () => {
    setEditingNode(null)
    router.refresh()
  }

  const handleDelete = async (nodeId: string, nodeTitle: string) => {
    if (!confirm(`确认删除节点「${nodeTitle}」？此操作不可撤销。`)) return
    setDeletingNode(nodeId)
    try {
      const res = await fetch(`/api/nodes/${nodeId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setDeletingNode(null)
    }
  }

  const handleQuickStatusChange = async (nodeId: string, newStatus: string) => {
    const res = await fetch(`/api/nodes/${nodeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) router.refresh()
  }

  if (!canEdit) return null

  return (
    <div className="space-y-3">
      {initialPhases.map(phase => (
        <div key={phase.id} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
            <span className="font-medium text-sm text-gray-700">{phase.name}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddingToPhase(phase.id === addingToPhase ? null : phase.id)}
              className="h-7 gap-1 text-xs"
            >
              <Plus size={12} />新增节点
            </Button>
          </div>

          {addingToPhase === phase.id && (
            <div className="p-4">
              <AddNodeForm
                phaseId={phase.id}
                projectId={projectId}
                users={availableUsers}
                onSuccess={handleAddSuccess}
                onCancel={() => setAddingToPhase(null)}
              />
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {phase.nodes.map(node => (
              <div key={node.id} className="px-4 py-3">
                {editingNode === node.id ? (
                  <EditNodeForm
                    node={node}
                    users={availableUsers}
                    onSuccess={handleEditSuccess}
                    onCancel={() => setEditingNode(null)}
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{node.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {node.assignee && <span>👤 {node.assignee} · </span>}
                        <select
                          value={node.status}
                          onChange={e => handleQuickStatusChange(node.id, e.target.value)}
                          className="text-xs border-0 bg-transparent cursor-pointer font-medium"
                        >
                          {NODE_STATUSES.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingNode(node.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(node.id, node.title)}
                        disabled={deletingNode === node.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        {deletingNode === node.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {phase.nodes.length === 0 && addingToPhase !== phase.id && (
              <div className="px-4 py-3 text-center text-xs text-gray-400">该阶段暂无节点</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
