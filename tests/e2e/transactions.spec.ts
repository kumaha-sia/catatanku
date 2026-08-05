import { test, expect } from "@playwright/test";

const EMAIL = `e2e-${Date.now()}@example.com`;
const PASSWORD = "password123456";
const NAME = "E2E Tester";

test.describe("Transaction Flow", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/register");
    await page.fill('input[id="name"]', NAME);
    await page.fill('input[id="email"]', EMAIL);
    await page.fill('input[id="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.close();
  });

  test("create account", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', EMAIL);
    await page.fill('input[id="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto("/accounts");
    await page.click("text=Tambah Rekening");

    await page.fill('input[id="name"]', "BCA Test");
    await page.fill('input[id="balance"]', "5000000");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=BCA Test")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=5.000.000")).toBeVisible();
  });

  test("create transaction", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', EMAIL);
    await page.fill('input[id="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto("/transactions");
    await page.click("text=Tambah Transaksi");

    await page.selectOption('select[id="txAccount"]', { index: 1 });
    await page.fill('input[id="txAmount"]', "50000");
    await page.fill('input[id="txDesc"]', "Makan siang");
    await page.fill('input[id="txDate"]', "2026-08-05");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Makan siang")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=50.000")).toBeVisible();
  });

  test("dashboard shows summary", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', EMAIL);
    await page.fill('input[id="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    await page.goto("/dashboard");

    await expect(page.locator("text=Total Saldo")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=Pemasukan")).toBeVisible();
    await expect(page.locator("text=Pengeluaran")).toBeVisible();
  });
});
