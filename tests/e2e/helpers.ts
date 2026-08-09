import { type Page, type BrowserContext } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

export async function registerUser(
  page: Page,
  name: string,
  email: string,
  password: string,
) {
  await page.goto("/register");
  await page.fill('input[id="name"]', name);
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

export async function createTestUser() {
  const timestamp = Date.now();
  return {
    name: `E2E User ${timestamp}`,
    email: `e2e-${timestamp}@example.com`,
    password: "password123456",
  };
}

export async function loginViaAPI(
  context: BrowserContext,
  email: string,
  password: string,
) {
  const response = await context.request.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    {
      form: {
        email,
        password,
        csrfToken: await getCsrfToken(context),
        json: "true",
      },
    },
  );
  return response;
}

async function getCsrfToken(context: BrowserContext) {
  const response = await context.request.get(`${BASE_URL}/api/auth/csrf`);
  const data = await response.json();
  return data.csrfToken;
}

export async function createAccountViaAPI(
  context: BrowserContext,
  name: string,
  type: string = "BANK",
  balance: number = 0,
) {
  const response = await context.request.post(`${BASE_URL}/api/accounts`, {
    data: { name, type, balance },
  });
  return response.json();
}

export async function createTransactionViaAPI(
  context: BrowserContext,
  data: {
    accountId: string;
    type: string;
    amount: number;
    description: string;
    date: string;
    categoryId?: string;
  },
) {
  const response = await context.request.post(`${BASE_URL}/api/transactions`, {
    data,
  });
  return response.json();
}
