import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2, Home, Building2, ShieldCheck, ArrowRight,
  Clock, BarChart3, MessageSquare, Package
} from 'lucide-react'

const DEMO_ACCOUNTS = [
  {
    role: '业主',
    username: 'zhang_ming',
    password: 'demo123',
    description: '查看装修进度、沟通反馈',
    href: '/homeowner',
    color: 'border-blue-200 bg-blue-50 hover:border-blue-400',
    labelColor: 'text-blue-700',
    icon: Home,
    iconColor: 'text-blue-500',
  },
  {
    role: '装修公司',
    username: 'lijiasheng',
    password: 'demo123',
    description: '节点更新、进度填报',
    href: '/company',
    color: 'border-purple-200 bg-purple-50 hover:border-purple-400',
    labelColor: 'text-purple-700',
    icon: Building2,
    iconColor: 'text-purple-500',
  },
  {
    role: '管理员',
    username: 'admin',
    password: 'demo123',
    description: '平台全局管理与监控',
    href: '/admin',
    color: 'border-amber-200 bg-amber-50 hover:border-amber-400',
    labelColor: 'text-amber-700',
    icon: ShieldCheck,
    iconColor: 'text-amber-500',
  },
]

const FEATURES = [
  { icon: Clock, title: '全流程时间线', desc: '拆除→水电→瓦工→木工→油漆→软装，全程可视化追踪' },
  { icon: BarChart3, title: '进度实时看板', desc: '节点完成率、阶段状态、整体进度一览无余' },
  { icon: MessageSquare, title: '在线沟通协作', desc: '业主与施工方在节点内直接留言，减少信息丢失' },
  { icon: Package, title: '材料采购追踪', desc: '记录每项材料的采购状态、品牌、到货信息' },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-primary">Clawfour</span>
            <span className="hidden sm:inline-block ml-1 text-sm text-textSecondary font-normal">装修管理</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/timeline">
              <Button variant="outline" size="sm">项目时间线</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                登录系统 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            测试环境 · test.clawfour.com
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-text">
            装修全流程{' '}
            <span className="text-primary">智能管理平台</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-textSecondary">
            连接业主与装修公司，通过透明的阶段管理、节点追踪和材料记录，打造无忧的装修体验。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base">
                立即体验 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/timeline">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                查看时间线
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-1">{title}</h3>
                  <p className="text-sm text-textSecondary leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Role Cards */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-3 text-center text-3xl font-bold text-text">为每个角色打造专属体验</h2>
          <p className="text-center text-textSecondary mb-12">三种角色，各有专属视图与操作权限</p>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <Home className="mb-4 h-12 w-12 text-primary" />
                <CardTitle>业主视角</CardTitle>
                <CardDescription>随时随地掌握装修进度</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-textSecondary">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> 查看项目阶段与时间线
                  </li>
                  <li className="flex items-center gap-2 text-textSecondary">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> 审核重要节点与材料
                  </li>
                  <li className="flex items-center gap-2 text-textSecondary">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> 在线沟通反馈意见
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-secondary">
              <CardHeader>
                <Building2 className="mb-4 h-12 w-12 text-secondary" />
                <CardTitle>装修公司</CardTitle>
                <CardDescription>标准化、数字化的项目执行</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-textSecondary">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> 多项目集中管理与看板
                  </li>
                  <li className="flex items-center gap-2 text-textSecondary">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> 现场进度与问题记录
                  </li>
                  <li className="flex items-center gap-2 text-textSecondary">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> 材料采购与进场追踪
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-warning">
              <CardHeader>
                <ShieldCheck className="mb-4 h-12 w-12 text-warning" />
                <CardTitle>系统管理</CardTitle>
                <CardDescription>平台运营与全局掌控</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-textSecondary">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> 用户与角色权限管理
                  </li>
                  <li className="flex items-center gap-2 text-textSecondary">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> 全局项目状态监控
                  </li>
                  <li className="flex items-center gap-2 text-textSecondary">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> 系统操作日志审计
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Demo Quick Access */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-text mb-2">测试环境快速访问</h2>
              <p className="text-textSecondary text-sm">点击角色卡片直接跳转对应页面（需先登录），或使用下方演示账号</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              {DEMO_ACCOUNTS.map(({ role, username, password, description, href, color, labelColor, icon: Icon, iconColor }) => (
                <Link key={role} href={href} className={`block rounded-xl border-2 p-5 transition-all ${color}`}>
                  <Icon className={`h-8 w-8 mb-3 ${iconColor}`} />
                  <div className={`text-sm font-bold mb-1 ${labelColor}`}>{role}</div>
                  <div className="text-xs text-textSecondary mb-3">{description}</div>
                  <div className="space-y-1">
                    <div className="text-xs bg-white rounded px-2 py-1 font-mono text-text border border-gray-100">
                      用户: {username}
                    </div>
                    <div className="text-xs bg-white rounded px-2 py-1 font-mono text-text border border-gray-100">
                      密码: {password}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="bg-white rounded-xl border p-5">
              <h3 className="text-sm font-semibold text-text mb-3">功能快速入口</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { href: '/login', label: '🔐 登录系统' },
                  { href: '/timeline', label: '📅 时间线' },
                  { href: '/dashboard', label: '📊 Dashboard' },
                  { href: '/admin', label: '🛡️ 管理后台' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-center px-3 py-2.5 rounded-lg bg-surface border border-gray-100 text-sm text-textSecondary hover:border-primary hover:text-primary hover:bg-blue-50 transition-colors font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-textSecondary text-sm">
          <p>© 2026 Clawfour Renovation Management Platform ·{' '}
            <a href="https://test.clawfour.com" className="text-primary hover:underline">test.clawfour.com</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
