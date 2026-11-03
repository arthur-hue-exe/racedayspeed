import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, type Page } from "@playwright/test";
import pg from "pg";

function loadEnv() {
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

loadEnv();

export const TEST_PRODUCT = "red-bull-grand-prix-of-the-americas";
export const UNPRICED_PRODUCT = "vr46-lunna-edicao-especial";
export const TEST_EMAIL = "e2e-cliente@raceday.test";

export const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function prepareStock() {
  await db.query(
    `update product_sizes ps
        set stock = case ps.label when 'M' then 5 when 'XGG' then 0 else null end
       from products p
      where p.id = ps.product_id and p.slug = $1`,
    [TEST_PRODUCT],
  );
}

export async function restoreStock() {
  await db.query(
    `update product_sizes ps
        set stock = null
       from products p
      where p.id = ps.product_id and p.slug = $1`,
    [TEST_PRODUCT],
  );
}

export async function cleanupTestData() {
  await db.query("delete from orders where customer_email = $1", [TEST_EMAIL]);
  const remaining = await db.query("select count(*)::int as total from orders");
  if (remaining.rows[0].total === 0) {
    await db.query("alter sequence order_code_seq restart with 1");
  }
}

export async function skipIntro(page: Page) {
  await page.addInitScript(() => {
    try {
      window.sessionStorage.setItem("raceday.intro.v1", "1");
    } catch {
      // ignore
    }
  });
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const viewport = window.visualViewport?.width ?? window.innerWidth;
    return document.documentElement.scrollWidth - viewport;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

export async function isMobile(page: Page) {
  const viewport = page.viewportSize();
  return (viewport?.width ?? 1440) < 1024;
}

export async function loginAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL ?? "");
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();
}
