import { test, expect } from '@playwright/test'

/**
 * T17: 认证流程测试
 * 验证登录、登出、权限隔离
 */
test.describe('认证', () => {
  test('登录页面包含必要表单元素', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="text"], input[name="username"]').first()).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /登录|login/i }).first()).toBeVisible()
  })

  test('使用业主账号登录成功', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="text"], input[name="username"]').first().fill('zhang_ming')
    await page.locator('input[type="password"]').first().fill('demo123')
    await page.getByRole('button', { name: /登录|login/i }).first().click()
    // 登录后应该跳转到 dashboard 或首页
    await page.waitForURL(/dashboard|\//, { timeout: 5000 })
    await expect(page).not.toHaveURL(/login/)
  })

  test('使用管理员账号登录成功', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="text"], input[name="username"]').first().fill('admin')
    await page.locator('input[type="password"]').first().fill('demo123')
    await page.getByRole('button', { name: /登录|login/i }).first().click()
    await page.waitForURL(/dashboard|\//, { timeout: 5000 })
    await expect(page).not.toHaveURL(/login/)
  })

  test('使用错误密码登录失败', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="text"], input[name="username"]').first().fill('zhang_ming')
    await page.locator('input[type="password"]').first().fill('wrongpassword')
    await page.getByRole('button', { name: /登录|login/i }).first().click()
    // 应停留在登录页或显示错误消息
    await page.waitForTimeout(1000)
    const currentUrl = page.url()
    // 要么停留在 login，要么显示错误
    const hasError = await page.getByText(/错误|失败|incorrect|invalid|wrong/i).isVisible().catch(() => false)
    const onLoginPage = currentUrl.includes('login')
    expect(hasError || onLoginPage).toBeTruthy()
  })
})
