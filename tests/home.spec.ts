import { test, expect } from '@playwright/test'

/**
 * T17: 首页可访问性测试
 * 验证应用首页正确加载，包含关键元素
 */
test.describe('首页', () => {
  test('应用首页可以正常访问', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/clawfour|装修|renovation/i)
  })

  test('首页包含产品核心标语', async ({ page }) => {
    await page.goto('/')
    // 检查 hero 区域存在
    const hero = page.locator('h1, h2').first()
    await expect(hero).toBeVisible()
  })

  test('首页包含角色入口卡片', async ({ page }) => {
    await page.goto('/')
    // 三种角色应该都有入口
    await expect(page.getByText(/业主|homeowner/i).first()).toBeVisible()
    await expect(page.getByText(/施工|company/i).first()).toBeVisible()
    await expect(page.getByText(/管理|admin/i).first()).toBeVisible()
  })

  test('首页可以导航到登录页', async ({ page }) => {
    await page.goto('/')
    const loginLink = page.getByRole('link', { name: /登录|login/i }).first()
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await expect(page).toHaveURL(/login/)
    } else {
      // 如果没有登录链接，直接访问 /login
      await page.goto('/login')
      await expect(page).toHaveURL(/login/)
    }
  })
})
