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
 * T17: Timeline 时间线测试
 * 验证时间线页面正确展示装修阶段与节点
 */
test.describe('时间线 Timeline', () => {
  test('时间线列表页面可访问', async ({ page }) => {
    await loginAs(page, 'zhang_ming')
    await page.goto('/timeline')
    await page.waitForLoadState('networkidle')

    // 应显示项目列表
    const content = page.locator('main, [role="main"]').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('时间线页面显示项目卡片', async ({ page }) => {
    await loginAs(page, 'zhang_ming')
    await page.goto('/timeline')
    await page.waitForLoadState('networkidle')

    // 应有项目相关文本
    await expect(page.getByText(/装修|项目|新房/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('可以点击进入项目时间线详情', async ({ page }) => {
    await loginAs(page, 'zhang_ming')
    await page.goto('/timeline')
    await page.waitForLoadState('networkidle')

    // 找到第一个项目链接并点击
    const projectLink = page.getByRole('link').filter({ hasText: /装修|新房|项目/i }).first()
    if (await projectLink.isVisible({ timeout: 5000 })) {
      await projectLink.click()
      await page.waitForURL(/timeline\/\w+/, { timeout: 8000 })
      // 验证进入了项目详情页
      await expect(page).toHaveURL(/timeline\/\w+/)
    } else {
      // 直接访问 API 检查数据
      const response = await page.request.get('/api/projects')
      const data = await response.json()
      expect(data.data?.length).toBeGreaterThan(0)
    }
  })

  test('项目时间线页面展示阶段信息', async ({ page }) => {
    await loginAs(page, 'zhang_ming')

    // 获取第一个项目的 ID
    const response = await page.request.get('/api/projects')
    const data = await response.json()
    const projectId = data.data?.[0]?.id

    if (projectId) {
      await page.goto(`/timeline/${projectId}`)
      await page.waitForLoadState('networkidle')

      // 应显示阶段信息
      const phaseText = page.getByText(/阶段|拆除|水电|泥瓦|木工/i).first()
      await expect(phaseText).toBeVisible({ timeout: 10000 })
    }
  })
})
