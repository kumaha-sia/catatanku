import { test, expect } from "@playwright/test";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "password123456";
const TEST_NAME = "Test User";

test.describe("Authentication Flow", () => {
  test("register creates account and redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/register");

    await expect(page.locator("h1, h2, [class*='text-2xl']")).toBeVisible();

    await page.fill('input[id="name"]', TEST_NAME);
    await page.fill('input[id="email"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);

    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page.url()).toContain("/dashboard");
  });

  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill('input[id="email"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);

    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await expect(page.url()).toContain("/dashboard");
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[id="email"]', "wrong@example.com");
    await page.fill('input[id="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=Email atau password salah")).toBeVisible({
      timeout: 10000,
    });
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/dashboard");

    await page.waitForURL("**/login**", { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });
});
