import { expect, test } from "@playwright/test";
import {
  UNPRICED_PRODUCT,
  expectNoHorizontalOverflow,
  skipIntro,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await skipIntro(page);
});

test("home apresenta identidade, CTAs e navegação sem overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Speed & Glory");
  await expect(page.getByRole("link", { name: /Explorar coleção/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver novidades/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("catálogo exibe os 25 produtos reais e busca funciona", async ({ page }) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "Catálogo completo" })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(25);
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Pesquisar produtos" }).click();
  const search = page.getByRole("searchbox", { name: "Buscar produtos" });
  await search.fill("Ducati");
  await expect(page.getByRole("link", { name: /Ducati 93 — Vermelha/i }).first()).toBeVisible();
});

test("produto sob consulta bloqueia compra e oferece WhatsApp", async ({ page }) => {
  await page.goto(`/produto/${UNPRICED_PRODUCT}`);
  await expect(page.getByText("Preço sob consulta", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Selecione um tamanho" })).toBeDisabled();
  await page.getByRole("button", { name: "Tamanho G", exact: true }).click();
  await expect(page.getByRole("button", { name: "Preço sob consulta" })).toBeDisabled();
  const consult = page.getByRole("link", { name: /Consultar valor no WhatsApp/i });
  await expect(consult).toHaveAttribute("href", /^https:\/\/wa\.me\/5561982817033\?text=/);
  await expectNoHorizontalOverflow(page);
});

test("política de privacidade e termos estão publicados", async ({ page }) => {
  await page.goto("/politicas/privacidade");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/privacidade/i);
  await page.goto("/politicas/termos-de-uso");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/termos/i);
});
