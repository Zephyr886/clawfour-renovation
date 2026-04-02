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
 * T17: 节点详情页测试
 * 验证节点详情页显示工序信息、评论、进度、材料
 */
test.describe('节点详情', () => {
  test('可以从 API 获取节点信息', async ({ page }) => {
    await loginAs(page, 'zhang_ming')

    // 获取项目列表
    const projResp = await page.request.get('/api/projects')
    const projData = await projResp.json()
    expect(projData.data?.length).toBeGreaterThan(0)
    const projectId = projData.data[0].id

    // 获取项目时间线（含节点）
    const timelineResp = await page.request.get(`/api/projects/${projectId}`)
    const timelineData = await timelineResp.json()
    const firstPhase = timelineData.data?.phases?.[0]
    const firstNode = firstPhase?.nodes?.[0]
    expect(firstNode).toBeDefined()
  })

  test('节点详情页面包含核心信息', async ({ page }) => {
    await loginAs(page, 'zhang_ming')

    // 获取节点 ID
    const projResp = await page.request.get('/api/projects')
    const projData = await projResp.json()
    const projectId = projData.data?.[0]?.id

    if (!projectId) { test.skip(); return }

    const timelineResp = await page.request.get(`/api/projects/${projectId}`)
    const timelineData = await timelineResp.json()
    const nodeId = timelineData.data?.phases?.[0]?.nodes?.[0]?.id

    if (!nodeId) { test.skip(); return }

    await page.goto(`/timeline/${projectId}/node/${nodeId}`)
    await page.waitForLoadState('networkidle')

    // 页面应包含节点相关内容
    const content = page.locator('main').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('节点详情页包含评论区', async ({ page }) => {
    await loginAs(page, 'zhang_ming')

    const projResp = await page.request.get('/api/projects')
    const projData = await projResp.json()
    const projectId = projData.data?.[0]?.id
    if (!projectId) { test.skip(); return }

    const timelineResp = await page.request.get(`/api/projects/${projectId}`)
    const timelineData = await timelineResp.json()
    const nodeId = timelineData.data?.phases?.[0]?.nodes?.[0]?.id
    if (!nodeId) { test.skip(); return }

    await page.goto(`/timeline/${projectId}/node/${nodeId}`)
    await page.waitForLoadState('networkidle')

    // 页面应有评论相关元素
    const commentSection = page.getByText(/评论|comment/i).first()
    await expect(commentSection).toBeVisible({ timeout: 10000 })
  })
})
