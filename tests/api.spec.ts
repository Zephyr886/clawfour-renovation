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
 * T17: API 接口基础测试
 * 验证核心 API 端点返回正确格式数据
 */
test.describe('API 接口', () => {
  test('GET /api/projects 返回项目列表', async ({ page }) => {
    await loginAs(page, 'zhang_ming')
    const response = await page.request.get('/api/projects')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data.length).toBeGreaterThan(0)
  })

  test('GET /api/projects/[id] 返回单个项目', async ({ page }) => {
    await loginAs(page, 'zhang_ming')

    const listResp = await page.request.get('/api/projects')
    const listData = await listResp.json()
    const projectId = listData.data[0]?.id

    const response = await page.request.get(`/api/projects/${projectId}`)
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.data).toHaveProperty('id', projectId)
    expect(data.data).toHaveProperty('phases')
    expect(Array.isArray(data.data.phases)).toBe(true)
  })

  test('GET /api/activity 返回活动日志', async ({ page }) => {
    await loginAs(page, 'zhang_ming')
    const response = await page.request.get('/api/activity')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('GET /api/materials?projectId=xxx 返回材料列表', async ({ page }) => {
    await loginAs(page, 'zhang_ming')

    const listResp = await page.request.get('/api/projects')
    const listData = await listResp.json()
    const projectId = listData.data[0]?.id

    const response = await page.request.get(`/api/materials?projectId=${projectId}`)
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('POST /api/comments 创建评论成功', async ({ page }) => {
    await loginAs(page, 'zhang_ming')

    const listResp = await page.request.get('/api/projects')
    const listData = await listResp.json()
    const projectId = listData.data[0]?.id
    const nodeId = listData.data[0]?.phases?.[0]?.nodes?.[0]?.id

    // 获取用户信息
    const meResp = await page.request.get('/api/auth/me')
    const meData = await meResp.json()
    const userId = meData.user?.id

    if (!projectId || !nodeId || !userId) {
      test.skip()
      return
    }

    const response = await page.request.post('/api/comments', {
      data: {
        targetType: 'NODE',
        targetId: nodeId,
        content: '这是一条自动化测试评论',
        projectId,
        userId,
      }
    })
    expect([200, 201]).toContain(response.status())
    const data = await response.json()
    expect(data).toHaveProperty('data')
  })

  test('POST /api/progress 创建进度记录成功', async ({ page }) => {
    await loginAs(page, 'lijiasheng')

    const listResp = await page.request.get('/api/projects')
    const listData = await listResp.json()
    const nodeId = listData.data[0]?.phases?.[0]?.nodes?.[0]?.id

    const meResp = await page.request.get('/api/auth/me')
    const meData = await meResp.json()
    const userId = meData.user?.id

    if (!nodeId || !userId) { test.skip(); return }

    const response = await page.request.post('/api/progress', {
      data: {
        nodeId,
        percentage: 50,
        note: '自动化测试进度记录',
        recordedBy: userId,
      }
    })
    expect([200, 201]).toContain(response.status())
  })
})
