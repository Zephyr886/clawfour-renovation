'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { SessionUser } from '@/types'

const materialStatuses = ['NOT_PURCHASED', 'ORDERED', 'PURCHASED', 'DELIVERED', 'INSTALLED']

export function MaterialsManager({
  projectId,
  projectName,
  nodes,
  initialMaterials,
  user,
}: {
  projectId: string
  projectName: string
  nodes: Array<{ id: string; title: string }>
  initialMaterials: any[]
  user?: SessionUser | null
}) {
  const router = useRouter()
  const canEdit = user?.role === 'COMPANY' || user?.role === 'ADMIN'
  const [materials, setMaterials] = useState(initialMaterials)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    quantity: '1',
    unit: '',
    price: '',
    description: '',
    nodeId: '',
    status: 'NOT_PURCHASED',
  })

  const editingMaterial = useMemo(() => materials.find(item => item.id === editingId), [materials, editingId])

  function resetForm() {
    setEditingId(null)
    setForm({ name: '', brand: '', category: '', quantity: '1', unit: '', price: '', description: '', nodeId: '', status: 'NOT_PURCHASED' })
  }

  function startEdit(material: any) {
    setEditingId(material.id)
    setForm({
      name: material.name || '',
      brand: material.brand || '',
      category: material.category || '',
      quantity: String(material.quantity || 1),
      unit: material.unit || '',
      price: material.price != null ? String(material.price) : '',
      description: material.description || '',
      nodeId: material.nodeId || '',
      status: material.status || 'NOT_PURCHASED',
    })
    setMessage(null)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!form.name.trim()) {
      setError('材料名称不能为空')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        projectId,
        name: form.name.trim(),
        brand: form.brand.trim() || undefined,
        category: form.category.trim() || undefined,
        quantity: Number(form.quantity || '1'),
        unit: form.unit.trim() || undefined,
        price: form.price ? Number(form.price) : null,
        description: form.description.trim() || undefined,
        nodeId: form.nodeId || null,
        status: form.status,
      }

      const res = await fetch(editingId ? `/api/materials/${editingId}` : '/api/materials', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '保存失败')

      if (editingId) {
        setMaterials(list => list.map(item => item.id === editingId ? data.data : item))
        setMessage('材料已更新')
      } else {
        setMaterials(list => [data.data, ...list])
        setMessage('材料已创建')
      }
      resetForm()
      router.refresh()
    } catch (err: any) {
      setError(err.message || '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(id: string, status: string) {
    setMessage(null)
    setError(null)
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '状态更新失败')
      setMaterials(list => list.map(item => item.id === id ? data.data : item))
      setMessage('材料状态已更新')
      router.refresh()
    } catch (err: any) {
      setError(err.message || '状态更新失败')
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">材料管理</h2>
          <p className="text-sm text-textSecondary">{projectName} · 共 {materials.length} 项材料</p>
        </div>
        {canEdit && (
          <Button type="button" onClick={() => { setMessage(null); setError(null); if (editingId) resetForm() }} className="gap-2">
            <Plus size={16} />
            {editingId ? '取消编辑' : '新增材料'}
          </Button>
        )}
      </div>

      {message && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {canEdit && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-surface p-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="material-name">材料名称</Label>
            <Input id="material-name" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-brand">品牌</Label>
            <Input id="material-brand" value={form.brand} onChange={e => setForm(v => ({ ...v, brand: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-category">分类</Label>
            <Input id="material-category" value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-node">关联节点</Label>
            <select id="material-node" value={form.nodeId} onChange={e => setForm(v => ({ ...v, nodeId: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">不关联节点</option>
              {nodes.map(node => <option key={node.id} value={node.id}>{node.title}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-quantity">数量</Label>
            <Input id="material-quantity" type="number" min="1" value={form.quantity} onChange={e => setForm(v => ({ ...v, quantity: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-unit">单位</Label>
            <Input id="material-unit" value={form.unit} onChange={e => setForm(v => ({ ...v, unit: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-price">单价</Label>
            <Input id="material-price" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(v => ({ ...v, price: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-status">状态</Label>
            <select id="material-status" value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {materialStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="material-description">备注</Label>
            <Textarea id="material-description" value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} rows={3} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={submitting}>{submitting ? '提交中...' : editingId ? '保存修改' : '创建材料'}</Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm}>取消</Button>}
          </div>
        </form>
      )}

      <div className="space-y-3">
        {materials.map(material => (
          <div key={material.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">{material.name}</span>
                  {material.brand && <span className="text-sm text-textSecondary">{material.brand}</span>}
                </div>
                <div className="text-sm text-textSecondary">
                  {material.category || '未分类'} · {material.quantity}{material.unit || ''} · {material.price != null ? `¥${material.price}` : '未填写价格'}
                </div>
                <div className="text-sm text-textSecondary">节点：{material.node?.title || '未关联'}</div>
                {material.description && <div className="text-sm text-textSecondary">备注：{material.description}</div>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canEdit ? (
                  <>
                    <select value={material.status} onChange={e => handleStatusChange(material.id, e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {materialStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <Button type="button" variant="outline" className="gap-2" onClick={() => startEdit(material)}>
                      <Pencil size={14} /> 编辑
                    </Button>
                  </>
                ) : (
                  <span className="rounded-full bg-surface px-3 py-1 text-sm text-textSecondary">{material.status}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {materials.length === 0 && <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-textSecondary">暂无材料数据</div>}
      </div>
    </div>
  )
}
