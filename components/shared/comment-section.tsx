'use client'

import { useState } from 'react'
import { formatRelativeTime, roleLabel } from '@/lib/utils'
import type { CommentWithUser } from '@/types'

interface CommentSectionProps {
  comments: CommentWithUser[]
  targetType: string
  targetId: string
  projectId?: string
  currentUserId?: string
}

export function CommentSection({ comments, targetType, targetId, projectId, currentUserId }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState(comments)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !currentUserId) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, content: content.trim(), projectId, userId: currentUserId }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setLocalComments(prev => [...prev, newComment])
        setContent('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">评论 ({localComments.length})</h3>

      <div className="space-y-3 mb-4">
        {localComments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
              {(comment.user.name || comment.user.username).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{comment.user.name || comment.user.username}</span>
                <span className="text-xs text-gray-400">{roleLabel(comment.user.role)}</span>
                <span className="text-xs text-gray-400 ml-auto">{formatRelativeTime(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {localComments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">暂无评论</p>
        )}
      </div>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="写下你的评论..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '...' : '发送'}
          </button>
        </form>
      )}
    </div>
  )
}
