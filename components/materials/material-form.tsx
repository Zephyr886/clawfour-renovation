'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Loader2 } from 'lucide-react'

interface MaterialFormProps {
  projectId: string
  nodeId?: string
  phases?: { id: string; name: string }[]
  onSuccess?: () => void
  onCancel?: () => void
}

const MATERIAL_STATUSES = [
  { value: 'NOT_PURCHASED', label: '未采购' },
  { value: 'ORDERED', label: '已订购' },
  { value: 'PURCHASED', label: '已采购' },
  { value: 'DELIVERED', label: '已到货' },
  { value: 'INSTALLED', label: '已安装' },
]

const CATEGORIES = [
  { value: 'main', label: '主材' },
  { value: 'auxiliary', label: '辅材' },
  { value: 'furniture', label: '家具' },
  { value: 'appliance', label: '家电' },
  { value: 'fixture', label: '洁具' },
  { value: 'other', label: '其他' },
]

export function MaterialForm({ projectId, nodeId, onSuccess, onCancel }: MaterialFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: 'main',
    quantity: '1',
    unit: '件',
    price: '',
    description: '',
    status: 'NOT_PURCHASED',
    nodeId: nodeId || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('材料名称不能为空')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          nodeId: form.nodeId || null,
          name: form.name.trim(),
          brand: form.brand.trim() || undefined,
          category: form.category,
          quantity: parseInt(form.quantity) || 1,
          unit: form.unit.trim() || undefined,
          price: form.price ? parseFloat(form.price) : undefined,
          description: form.description.trim() || undefined,
          status: form.status,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '提交失败')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || '提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label htmlFor="mat-name">材料名称 *</Label>
          <Input
            id="mat-name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="例如：大理石地砖"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="mat-brand">品牌</Label>
          <Input
            id="mat-brand"
            value={form.brand}
            onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
            placeholder="品牌名称"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="mat-category">分类</Label>
          <select
            id="mat-category"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="mat-qty">数量</Label>
          <Input
            id="mat-qty"
            type="number"
            min="1"
            value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="mat-unit">单位</Label>
          <Input
            id="mat-unit"
            value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            placeholder="件/平米/米"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="mat-price">单价 (元)</Label>
          <Input
            id="mat-price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder="可选"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="mat-status">状态</Label>
          <select
            id="mat-status"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {MATERIAL_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <Label htmlFor="mat-desc">备注</Label>
          <textarea
            id="mat-desc"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="可选备注信息"
            rows={2}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? <><Loader2 size={14} className="animate-spin mr-1" />提交中...</> : <><Plus size={14} className="mr-1" />新增材料</>}
        </Button>
      </div>
    </form>
  )
}
