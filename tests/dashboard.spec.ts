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
 * T17: Dashboard 测试
 * 验证 Dashboard 可以正确渲染数据
 */
test.describe('Dashboard', () => {
  test('业主登录后 Dashboard 显示统计信息', async ({ page }) => {
    await loginAs(page, 'zhang_ming')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Dashboard 应包含数字统计卡片
    const cards = page.locator('.card, [class*="card"]')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
  })

  test('Dashboard 页面显示项目信息', async ({ page }) => {
    await loginAs(page, 'zhang_ming')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // 应有项目相关内容
    const projectText = await page.getByText(/项目|project/i).first()
    await expect(projectText).toBeVisible({ timeout: 10000 })
  })

  test('管理员 Dashboard 可以访问', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // 页面应成功加载（不是404或500）
    const statusCode = await page.evaluate(() => {
      return document.querySelector('h1, h2, main')?.textContent?.length || 0
    })
    expect(statusCode).toBeGreaterThan(0)
  })
})
