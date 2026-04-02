'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ProgressFormProps {
  nodeId: string
  projectId: string
}

export function ProgressForm({ nodeId, projectId }: ProgressFormProps) {
  const [percentage, setPercentage] = useState(50)
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, percentage, note, projectId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '提交失败')
      }
      setNote('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          进度百分比: <span className="text-[#3B82F6] font-bold">{percentage}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#3B82F6]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">备注说明</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="描述当前进度情况..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-600">✓ 进度记录已保存</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '更新中...' : '更新进度'}
      </Button>
    </form>
  )
}
