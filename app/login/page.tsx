'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登录失败')
        return
      }

      const role = data.user?.role
      if (role === 'ADMIN') router.push('/admin')
      else if (role === 'COMPANY') router.push('/company')
      else router.push('/homeowner')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Home className="h-8 w-8 text-[#3B82F6]" />
            <span className="text-2xl font-bold text-[#3B82F6]">Clawfour</span>
          </div>
          <p className="text-[#6B7280] text-sm">装修全流程管理平台</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-semibold text-[#111827] mb-6 text-center">登录账号</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-shadow"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 px-4 bg-[#3B82F6] text-white rounded-xl text-sm font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-medium text-[#6B7280] mb-3 text-center">演示账号</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '业主', user: 'zhang_ming', role: 'HOMEOWNER' },
                { label: '装修公司', user: 'lijiasheng', role: 'COMPANY' },
                { label: '管理员', user: 'admin', role: 'ADMIN' },
                { label: '业主2', user: 'li_fang', role: 'HOMEOWNER' },
              ].map((demo) => (
                <button
                  key={demo.user}
                  type="button"
                  onClick={() => { setUsername(demo.user); setPassword('demo123') }}
                  className="text-left px-3 py-2 rounded-lg bg-[#F9FAFB] border border-gray-100 hover:border-[#3B82F6] hover:bg-blue-50 transition-colors"
                >
                  <div className="text-xs font-medium text-[#111827]">{demo.label}</div>
                  <div className="text-xs text-[#6B7280] truncate">{demo.user}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-[#9CA3AF] text-center mt-2">所有演示账号密码均为 demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
