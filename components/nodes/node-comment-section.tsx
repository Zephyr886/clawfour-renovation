'use client'

import { useState } from 'react'
import { formatRelativeTime, roleLabel } from '@/lib/utils'

// Standalone form for node detail page (server component embedding)
export function NodeCommentForm({ nodeId, projectId }: { nodeId: string; projectId?: string }) {
  return <NodeCommentFormInner nodeId={nodeId} projectId={projectId} />
}

function NodeCommentFormInner({ nodeId, projectId }: { nodeId: string; projectId?: string }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'Node', targetId: nodeId, content: content.trim(), projectId }),
      })
      if (res.ok) {
        setSuccess(true)
        setContent('')
        setTimeout(() => window.location.reload(), 600)
      } else {
        const data = await res.json()
        setError(data.error || '提交失败，请重试')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="写下你的评论或问题..."
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-600">✓ 评论已发送，页面刷新中...</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '发送中...' : '发送评论'}
        </button>
      </div>
    </form>
  )
}

interface Comment {
  id: string
  content: string
  createdAt: string | Date
  user: {
    id: string
    name: string | null
    username: string
    role: string
  }
}

interface NodeCommentSectionProps {
  comments: Comment[]
  nodeId: string
  projectId?: string
  currentUserId?: string
}

const roleColors: Record<string, string> = {
  HOMEOWNER: 'bg-blue-500',
  COMPANY: 'bg-purple-500',
  ADMIN: 'bg-orange-500',
}

export function NodeCommentSection({ comments, nodeId, projectId, currentUserId }: NodeCommentSectionProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState(comments)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !currentUserId) return
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/nodes/${nodeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), projectId }),
      })
      if (res.ok) {
        const { data } = await res.json()
        setLocalComments(prev => [...prev, data])
        setContent('')
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
    <div>
      <div className="space-y-4 mb-5">
        {localComments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full ${roleColors[comment.user.role] || 'bg-gray-400'} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
              {(comment.user.name || comment.user.username).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">
                  {comment.user.name || comment.user.username}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {roleLabel(comment.user.role)}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{formatRelativeTime(comment.createdAt)}</span>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
        {localComments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm text-gray-400">暂无评论，第一个留言吧</p>
          </div>
        )}
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="写下你的评论或问题..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '发送中...' : '发送评论'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded-lg">
          请先登录后发表评论
        </div>
      )}
    </div>
  )
}
