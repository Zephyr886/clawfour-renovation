'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { SessionUser } from '@/types'

const nodeStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']
const urgencyOptions = ['NORMAL', 'TODO', 'URGENT', 'EMERGENCY']

export function NodesManager({ projectId, phases, user }: { projectId: string; phases: any[]; user?: SessionUser | null }) {
  const router = useRouter()
  const canEdit = user?.role === 'COMPANY' || user?.role === 'ADMIN'
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [form, setForm] = useState({
    phaseId: phases[0]?.id || '',
    title: '',
    description: '',
    urgency: 'NORMAL',
    assignee: '',
    plannedDate: '',
    actualDate: '',
    status: 'PENDING',
    order: '1',
  })

  function resetForm() {
    setEditingNodeId(null)
    setForm({ phaseId: phases[0]?.id || '', title: '', description: '', urgency: 'NORMAL', assignee: '', plannedDate: '', actualDate: '', status: 'PENDING', order: '1' })
  }

  function beginEdit(node: any) {
    setEditingNodeId(node.id)
    setForm({
      phaseId: node.phaseId,
      title: node.title || '',
      description: node.description || '',
      urgency: node.urgency || 'NORMAL',
      assignee: node.assignee || '',
      plannedDate: node.plannedDate ? new Date(node.plannedDate).toISOString().slice(0, 10) : '',
      actualDate: node.actualDate ? new Date(node.actualDate).toISOString().slice(0, 10) : '',
      status: node.status || 'PENDING',
      order: String(node.order || 1),
    })
    setMessage(null)
    setError(null)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!form.phaseId || !form.title.trim()) {
      setError('阶段与节点名称不能为空')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        phaseId: form.phaseId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        urgency: form.urgency,
        assignee: form.assignee.trim() || undefined,
        plannedDate: form.plannedDate || null,
        actualDate: form.actualDate || null,
        status: form.status,
        order: Number(form.order || '1'),
      }

      const res = await fetch(editingNodeId ? `/api/nodes/${editingNodeId}` : `/api/timelines/${projectId}/nodes`, {
        method: editingNodeId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '保存失败')
      setMessage(editingNodeId ? '节点已更新' : '节点已创建')
      resetForm()
      router.refresh()
    } catch (err: any) {
      setError(err.message || '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function patchNode(id: string, payload: any, successMessage: string) {
    setMessage(null)
    setError(null)
    try {
      const res = await fetch(`/api/nodes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '更新失败')
      setMessage(successMessage)
      router.refresh()
    } catch (err: any) {
      setError(err.message || '更新失败')
    }
  }

  async function deleteNode(id: string) {
    if (!confirm('确认删除该节点？')) return
    setMessage(null)
    setError(null)
    try {
      const res = await fetch(`/api/nodes/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '删除失败')
      setMessage('节点已删除')
      router.refresh()
    } catch (err: any) {
      setError(err.message || '删除失败')
    }
  }

  return (
    <div className="space-y-4">
      {message && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {canEdit && (
        <form onSubmit={submitForm} className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>所属阶段</Label>
            <select value={form.phaseId} onChange={e => setForm(v => ({ ...v, phaseId: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {phases.map(phase => <option key={phase.id} value={phase.id}>{phase.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>节点名称</Label>
            <Input value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>描述</Label>
            <Textarea value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>负责人</Label>
            <Input value={form.assignee} onChange={e => setForm(v => ({ ...v, assignee: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>排序</Label>
            <Input type="number" min="1" value={form.order} onChange={e => setForm(v => ({ ...v, order: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>状态</Label>
            <select value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {nodeStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>紧急程度</Label>
            <select value={form.urgency} onChange={e => setForm(v => ({ ...v, urgency: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {urgencyOptions.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>计划日期</Label>
            <Input type="date" value={form.plannedDate} onChange={e => setForm(v => ({ ...v, plannedDate: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>实际日期</Label>
            <Input type="date" value={form.actualDate} onChange={e => setForm(v => ({ ...v, actualDate: e.target.value }))} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={submitting}>{submitting ? '提交中...' : editingNodeId ? '保存节点' : '新增节点'}</Button>
            {editingNodeId && <Button type="button" variant="outline" onClick={resetForm}>取消</Button>}
          </div>
        </form>
      )}

      <div className="space-y-6">
        {phases.map(phase => (
          <div key={phase.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text">{phase.name}</h3>
                <p className="text-sm text-textSecondary">{phase.nodes?.length || 0} 个节点</p>
              </div>
            </div>
            <div className="space-y-3">
              {(phase.nodes || []).map((node: any) => (
                <div key={node.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium text-text">{node.title}</div>
                      <div className="text-sm text-textSecondary">负责人：{node.assignee || '未分配'} · 排序：{node.order}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canEdit ? (
                        <>
                          <select value={node.status} onChange={e => patchNode(node.id, { status: e.target.value }, '节点状态已更新')} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                            {nodeStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                          </select>
                          <Button type="button" variant="outline" onClick={() => beginEdit(node)}>编辑</Button>
                          <Button type="button" variant="outline" onClick={() => deleteNode(node.id)}>删除</Button>
                        </>
                      ) : (
                        <span className="rounded-full bg-surface px-3 py-1 text-sm text-textSecondary">{node.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(phase.nodes || []).length === 0 && <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-textSecondary">暂无节点</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
