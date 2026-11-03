import { expect, test } from "@playwright/test";
import {
  TEST_EMAIL,
  TEST_PRODUCT,
  cleanupTestData,
  db,
  expectNoHorizontalOverflow,
  isMobile,
  loginAdmin,
  prepareStock,
  restoreStock,
  skipIntro,
} from "./helpers";

let orderCode = "";
let orderToken = "";

test.describe.serial("fluxo real da loja", () => {
  test.beforeAll(async () => {
    await cleanupTestData();
    await prepareStock();
  });

  test.afterAll(async () => {
    await cleanupTestData();
    await restoreStock();
    await db.end();
  });

  test.beforeEach(async ({ page }) => {
    await skipIntro(page);
  });

  test("tamanho esgotado é bloqueado e carrinho persiste", async ({ page }) => {
    await page.goto(`/produto/${TEST_PRODUCT}`);

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Red Bull Grand Prix");
    await expect(page.getByRole("button", { name: "Selecione um tamanho" })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Tamanho XGG — esgotado/ })).toBeDisabled();

    await page.getByRole("button", { name: "Tamanho M", exact: true }).click();
    await expect(page.getByText("5 unidade(s) em estoque.")).toBeVisible();

    const addButton = page.getByRole("button", { name: "Adicionar ao carrinho" });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    const drawer = page.getByRole("dialog", { name: "Seu carrinho" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Red Bull Grand Prix of the Americas").first()).toBeVisible();
    await expect(drawer.getByText("R$ 100,00").first()).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("button", { name: "Abrir carrinho, 1 item(ns)" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("checkout valida, registra pedido no banco e abre o WhatsApp", async ({ page }) => {
    await page.goto(`/produto/${TEST_PRODUCT}`);
    await page.getByRole("button", { name: "Tamanho M", exact: true }).click();
    await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
    await page.getByRole("link", { name: /Finalizar pedido/i }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    const submit = page.getByRole("button", { name: /Registrar pedido e abrir WhatsApp/i });
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page.getByText("Informe seu nome completo.")).toBeVisible();
    await expect(page.getByText("Informe um CEP com 8 dígitos.")).toBeVisible();

    await page.locator("#customerName").fill("Cliente Teste E2E");
    await page.locator("#customerPhone").fill("(61) 98281-7033");
    await page.locator("#customerEmail").fill(TEST_EMAIL);

    await page.route("**/api/cep/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          street: "Rua Teste E2E",
          neighborhood: "Asa Sul",
          city: "Brasília",
          state: "DF",
        }),
      });
    });
    await page.locator("#cep").fill("70040-010");
    await page.getByRole("button", { name: "Buscar", exact: true }).click();
    await expect(page.locator("#street")).toHaveValue("Rua Teste E2E");
    await expect(page.locator("#city")).toHaveValue("Brasília");
    await expect(page.locator("#state")).toHaveValue("DF");

    await page.locator("#addressNumber").fill("123");
    await page.locator("#terms").check();

    await page.evaluate(() => {
      window.open = () => null;
    });
    await submit.click();

    await page.waitForURL(/\/pedido\/RD-\d{6}(\?|$)/);
    const url = new URL(page.url());
    orderCode = url.pathname.split("/").pop() ?? "";
    orderToken = url.searchParams.get("token") ?? "";
    expect(orderCode).toMatch(/^RD-\d{6}$/);
    expect(orderToken).toMatch(/^[0-9a-f-]{36}$/);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(`Pedido #${orderCode}`);
    await expect(
      page.getByRole("heading", { name: /Falta um passo: envie no WhatsApp/i }),
    ).toBeVisible();

    const stored = await db.query("select * from orders where code = $1", [orderCode]);
    const order = stored.rows[0];
    expect(order.customer_email).toBe(TEST_EMAIL);
    expect(order.status).toBe("awaiting_whatsapp");
    expect(order.shipping_cents).toBeNull();
    expect(order.subtotal_cents).toBe(10000);
    expect(order.access_token).toBe(orderToken);

    const items = await db.query("select * from order_items where order_id = $1", [order.id]);
    expect(items.rows).toHaveLength(1);
    expect(items.rows[0]).toMatchObject({
      product_slug: TEST_PRODUCT,
      size_label: "M",
      quantity: 1,
      unit_price_cents: 10000,
    });

    page.on("popup", (popup) => {
      void popup.close().catch(() => undefined);
    });
    await page.getByRole("link", { name: /Enviar pedido no WhatsApp/i }).click();
    await expect(page.getByText("WhatsApp aberto em outra aba.", { exact: false })).toBeVisible();

    await expect
      .poll(async () => {
        const result = await db.query(
          "select status, whatsapp_opened_at from orders where code = $1",
          [orderCode],
        );
        return {
          status: result.rows[0]?.status,
          opened: Boolean(result.rows[0]?.whatsapp_opened_at),
        };
      })
      .toEqual({ status: "awaiting_confirmation", opened: true });
  });

  test("painel exige autenticação e rejeita senha incorreta", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: /painel/i })).toBeVisible();

    await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL ?? "");
    await page.getByLabel("Senha").fill("senha-incorreta-e2e");
    await page.getByRole("button", { name: "Entrar no painel" }).click();
    await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
  });

  test("admin confirma pedido, baixa estoque e encerra sessão", async ({ page, request }) => {
    if (!orderCode) {
      const created = await request.post("/api/orders", {
        data: {
          customerName: "Cliente Teste E2E",
          customerPhone: "(61) 98281-7033",
          customerEmail: TEST_EMAIL,
          cep: "70040-010",
          state: "DF",
          city: "Brasília",
          neighborhood: "Asa Sul",
          street: "Rua Teste E2E",
          addressNumber: "123",
          complement: "",
          reference: "",
          terms: true,
          website: "",
          items: [{ slug: TEST_PRODUCT, size: "M", quantity: 1 }],
        },
      });
      expect(created.status()).toBe(201);
      const payload = (await created.json()) as { code: string; accessToken: string };
      orderCode = payload.code;
      orderToken = payload.accessToken;
      await request.post(`/api/orders/${orderCode}/whatsapp-opened`, {
        data: { token: orderToken },
      });
    }

    await loginAdmin(page);
    await expectNoHorizontalOverflow(page);

    if (await isMobile(page)) {
      await page.getByRole("button", { name: "Abrir menu do painel" }).click();
      await expect(page.getByRole("link", { name: "Categorias", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Fechar menu do painel" }).click();
      await expect(page.getByRole("link", { name: "Categorias", exact: true })).toBeHidden();
    }

    await page.goto(`/admin/pedidos?q=${orderCode}`);
    await page.getByRole("link", { name: new RegExp(orderCode) }).first().click();
    await expect(page).toHaveURL(/\/admin\/pedidos\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(`Pedido #${orderCode}`);
    await expect(page.getByText("Aguardando confirmação", { exact: true }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByLabel("Novo status").selectOption("confirmed");
    await page.getByRole("button", { name: "Atualizar status" }).click();
    await expect(page.getByText("Status atualizado.")).toBeVisible();
    await expect(page.getByText("Estoque já baixado")).toBeVisible();

    const updated = await db.query(
      "select status, stock_committed from orders where code = $1",
      [orderCode],
    );
    expect(updated.rows[0]).toEqual({ status: "confirmed", stock_committed: true });

    const stock = await db.query(
      `select ps.stock from product_sizes ps
         join products p on p.id = ps.product_id
        where p.slug = $1 and ps.label = 'M'`,
      [TEST_PRODUCT],
    );
    expect(stock.rows[0].stock).toBe(4);

    if (await isMobile(page)) {
      await page.getByRole("button", { name: "Abrir menu do painel" }).click();
      await page.getByRole("button", { name: "Sair", exact: true }).click();
    } else {
      await page.getByRole("button", { name: "Sair do painel" }).click();
    }
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
