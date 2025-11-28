import { test, expect } from "@playwright/test";

test.describe("Tarefas", () => {
  test("cria uma tarefa e ela aparece na lista", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: /Adicionar Tarefa/i }).click();

    const uniqueTitle = `Task ${Date.now()}`;

    await page.getByLabel("Título:").fill(uniqueTitle);
    await page.getByLabel("Descrição:").fill("Descrição teste e2e");
    await page.locator("#user").selectOption({ index: 1 });
    await page.locator("#category").selectOption({ index: 1 });
    await page.getByRole("button", { name: /Criar/i }).click();
    await expect(page.getByText(uniqueTitle)).toBeVisible();
  });

  test("exclui uma tarefa e ela some da lista", async ({ page }) => {
    await page.goto("/tasks");

    await page.getByRole("button", { name: /Adicionar Tarefa/i }).click();

    const tempTitle = `Temp Task ${Date.now()}`;
    await page.getByLabel("Título:").fill(tempTitle);
    await page.getByLabel("Descrição:").fill("Temp desc");
    await page.locator("#user").selectOption({ index: 1 });
    await page.locator("#category").selectOption({ index: 1 });
    await page.getByRole("button", { name: /Criar/i }).click();
    await expect(page.getByText(tempTitle)).toBeVisible();
    page.on("dialog", (dialog) => dialog.accept());

    const row = page.locator("tr", { has: page.getByText(tempTitle) });
    await row.getByRole("button", { name: /Excluir/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(tempTitle)).not.toBeVisible();
  });
});
