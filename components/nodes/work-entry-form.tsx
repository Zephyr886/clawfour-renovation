'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'

interface WorkEntryFormProps {
  nodeId: string
}

const ENTRY_TYPES = [
  { value: 'PROGRESS', label: '进度更新' },
  { value: 'ISSUE', label: '问题记录' },
  { value: 'INSPECTION', label: '验收记录' },
  { value: 'PHOTO', label: '照片记录' },
  { value: 'DIALOGUE', label: '沟通记录' },
]

export function WorkEntryForm({ nodeId }: WorkEntryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    type: 'PROGRESS',
    title: '',
    content: '',
    urgency: 'NORMAL',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('标题不能为空')
      return
    }
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch(`/api/nodes/${nodeId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          title: form.title.trim(),
          content: form.content.trim() || undefined,
          urgency: form.urgency,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '提交失败')
      setSuccess(true)
      setForm({ type: 'PROGRESS', title: '', content: '', urgency: 'NORMAL' })
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err: any) {
      setError(err.message || '提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}
      {success && <div className="p-2 bg-green-50 text-green-600 text-xs rounded-lg">✓ 工作记录已提交</div>}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">记录类型</Label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="mt-1 w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white"
          >
            {ENTRY_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">紧急程度</Label>
          <select
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
      </div>
      <div>
        <Label className="text-xs">标题 *</Label>
        <Input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="简要描述工作内容"
          className="mt-1 h-8 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs">详细内容</Label>
        <textarea
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder="可选的详细说明"
          rows={3}
          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading} className="w-full">
        {loading ? (
          <><Loader2 size={14} className="animate-spin mr-1" />提交中...</>
        ) : (
          <><Plus size={14} className="mr-1" />提交记录</>
        )}
      </Button>
    </form>
  )
}
