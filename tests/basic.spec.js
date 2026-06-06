import { test, expect } from '@playwright/test';

test.describe('Medical Appointments App', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Medical Appointments/);
    await expect(page.locator('h2')).toContainText('Login to Medical Appointments');
  });

  test('should login as admin', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Click demo admin login
    await page.click('text=Login as Admin');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page.locator('h2')).toContainText('Dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should navigate to appointments', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000');
    await page.click('text=Login as Admin');
    await page.click('button[type="submit"]');
    
    // Navigate to appointments
    await page.click('text=View Appointments');
    await expect(page.locator('h2')).toContainText('Appointments');
  });
});