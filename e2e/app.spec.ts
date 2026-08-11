import { test, expect } from '@playwright/test';

test.describe('MyDuitku E2E Suite', () => {
  const routes = [
    { path: '/', title: 'Home / Dashboard' },
    { path: '/onboarding', title: 'Onboarding' },
    { path: '/settings', title: 'Settings' },
    { path: '/meowcap', title: 'MeowCap' },
    { path: '/achievements', title: 'Achievements' },
    { path: '/analytics', title: 'Analytics' },
    { path: '/diary', title: 'Diary' },
    { path: '/play', title: 'Play / Mini-games' },
  ];

  for (const route of routes) {
    test(`should load ${route.title} (${route.path}) without errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);

      // Wait for network idle / rendering
      await page.waitForLoadState('domcontentloaded');

      // Check page visibility
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Take a screenshot of each page
      await page.screenshot({ path: `e2e-screenshots${route.path === '/' ? '/home' : route.path}.png` });

      // Fail if severe JavaScript errors occurred (excluding minor 404 resource logs & DevTools tips)
      const criticalErrors = consoleErrors.filter(err => 
        !err.includes('Download the React DevTools') &&
        !err.includes('Failed to load resource')
      );
      expect(criticalErrors).toEqual([]);
    });
  }

  test('should allow interaction on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify main app content is visible
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
  });
});
