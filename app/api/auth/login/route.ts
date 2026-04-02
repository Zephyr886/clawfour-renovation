export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getUserByUsername } from '@/lib/data'
import { signToken, COOKIE_NAME } from '@/lib/auth'

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'clawfour-salt').digest('hex')
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
    }

    const user = await getUserByUsername(username)

    if (!user || user.password !== hashPassword(password)) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }

    if (user.isDisabled) {
      return NextResponse.json({ error: '账号已被禁用，请联系管理员' }, { status: 403 })
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 })
  }
}
