import { test, expect, Page } from '@playwright/test'

/**
 * 辅助函数：以指定用户身份登录
 */
async function loginAs(page: Page, username: string, password = 'demo123') {
  await page.goto('/login')
  await page.locator('input[type="text"], input[name="username"]').first().fill(username)
  await page.locator('input[type="password"]').first().fill(password)
  await page.getByRole('button', { name: /登录|login/i }).first().click()
  await page.waitForURL(/dashboard|\/(?!login)/, { timeout: 8000 })
}

/**
 * T17: 角色专属页面测试
 * 验证 admin / homeowner / company 各角色页面可访问
 */
test.describe('角色专属页面', () => {
  test('管理员可以访问 admin 页面', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    // 应显示平台总览
    const header = page.getByText(/总览|管理|admin/i).first()
    await expect(header).toBeVisible({ timeout: 10000 })
  })

  test('业主可以访问 homeowner 页面', async ({ page }) => {
    await loginAs(page, 'zhang_ming')
    await page.goto('/homeowner')
    await page.waitForLoadState('networkidle')

    // 应显示业主相关内容
    const content = page.locator('main').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('施工方可以访问 company 页面', async ({ page }) => {
    await loginAs(page, 'lijiasheng')
    await page.goto('/company')
    await page.waitForLoadState('networkidle')

    // 应显示施工方相关内容
    const content = page.locator('main').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('Admin 页面包含用户统计', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    // 应有注册用户相关数字
    const userStat = page.getByText(/注册用户|用户/i).first()
    await expect(userStat).toBeVisible({ timeout: 10000 })
  })

  test('Homeowner 页面包含项目信息', async ({ page }) => {
    await loginAs(page, 'zhang_ming')
    await page.goto('/homeowner')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/项目|装修/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('Company 页面包含施工项目信息', async ({ page }) => {
    await loginAs(page, 'lijiasheng')
    await page.goto('/company')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/项目|施工|工程/i).first()).toBeVisible({ timeout: 10000 })
  })
})
