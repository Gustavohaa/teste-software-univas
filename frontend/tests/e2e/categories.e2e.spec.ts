import { test, expect } from "@playwright/test";

test.describe("Categorias", () => {
  test("navega para Categorias e lista itens do backend", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Categorias" }).click();

    await expect(
      page.getByRole("heading", { name: /Categorias/i })
    ).toBeVisible();

    const firstRow = page.locator("table tbody tr").first();
    
    await expect(firstRow).toBeVisible();
  });

  test("cria categoria e aparece na lista", async ({ page }) => {
    await page.goto("/categories");
    await page.getByRole("button", { name: /Adicionar Categoria/i }).click();

    const uniqueName = `Categoria ${Date.now()}`;

    await page.getByLabel("Nome:").fill(uniqueName);
    await page.getByLabel("Descrição:").fill("Descrição teste e2e");
    await page.getByRole("button", { name: /Criar/i }).click();
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test("atualiza categoria e reflete na lista", async ({ page }) => {
    await page.goto("/categories");
    await page.getByRole("button", { name: /Adicionar Categoria/i }).click();

    const originalName = `Cat Inicial ${Date.now()}`;

    await page.getByLabel("Nome:").fill(originalName);
    await page.getByLabel("Descrição:").fill("Desc inicial");
    await page.getByRole("button", { name: /Criar/i }).click();
    await expect(page.getByText(originalName)).toBeVisible();

    const row = page.locator("tr", { has: page.getByText(originalName) });

    await row.getByRole("button", { name: /Editar/i }).click();
    await expect(page.getByLabel("Nome:")).toHaveValue(originalName);
    await expect(page.getByLabel("Descrição:")).toHaveValue("Desc inicial");

    const updatedName = `Categoria Atualizada ${Date.now()}`;

    await page.getByLabel("Nome:").fill(updatedName);
    await page.getByRole("button", { name: /Atualizar/i }).click();
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test("exclui categoria e remove da lista", async ({ page }) => {
    await page.goto("/categories");
    await page.getByRole("button", { name: /Adicionar Categoria/i }).click();

    const tempName = `TempCat ${Date.now()}`;

    await page.getByLabel("Nome:").fill(tempName);
    await page.getByLabel("Descrição:").fill("desc temp");
    await page.getByRole("button", { name: /Criar/i }).click();
    await expect(page.getByText(tempName)).toBeVisible();
    page.on("dialog", (dialog) => dialog.accept());

    const row = page.locator("tr", { has: page.getByText(tempName) });

    await row.getByRole("button", { name: /Excluir/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(tempName)).not.toBeVisible();
  });
});
