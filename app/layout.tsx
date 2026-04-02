import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clawfour 装修全流程管理',
  description: '连接业主与装修公司的全流程节点管理平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={cn(inter.className, 'min-h-screen bg-surface text-text')}>
        {children}
      </body>
    </html>
  )
}
