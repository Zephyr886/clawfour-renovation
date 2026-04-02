'use client'

import { useState } from 'react'

interface ProgressFormSectionProps {
  nodeId: string
  projectId?: string
  currentUserId?: string
}

export function ProgressFormSection({ nodeId, projectId, currentUserId }: ProgressFormSectionProps) {
  const [percentage, setPercentage] = useState(50)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId,
          percentage,
          note: note.trim() || undefined,
          projectId,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setNote('')
        setTimeout(() => {
          window.location.reload()
        }, 800)
      } else {
        const { error: msg } = await res.json()
        setError(msg || '提交失败，请重试')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs font-medium text-gray-600 mb-2">记录新进度</p>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={percentage}
          onChange={e => setPercentage(Number(e.target.value))}
          className="flex-1 accent-blue-500"
        />
        <span className="text-sm font-bold text-blue-600 w-12 text-right">{percentage}%</span>
      </div>
      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="进度备注（可选）"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-600">✓ 进度已记录，页面刷新中...</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? '提交中...' : '提交进度'}
      </button>
    </form>
  )
}
