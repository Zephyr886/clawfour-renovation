import { test, expect } from '@playwright/test';

test.describe('Renovation App E2E', () => {
  
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=装修全流程')).toBeVisible();
    await expect(page.locator('text=登录')).toBeVisible();
  });

  test('login flow and dashboard routing', async ({ page }) => {
    await page.goto('/login');
    
    // Login as homeowner
    await page.fill('input[type="text"]', 'zhangwei');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to homeowner dashboard
    await page.waitForURL('/homeowner');
    await expect(page.locator('text=业主概览')).toBeVisible();
  });

  test('admin dashboard visibility', async ({ page }) => {
    await page.goto('/login');
    
    // Login as admin
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await page.waitForURL('/admin');
    await expect(page.locator('text=项目总数')).toBeVisible();
  });

});
