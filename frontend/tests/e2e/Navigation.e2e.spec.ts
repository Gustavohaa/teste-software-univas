import { test, expect } from '@playwright/test';

test.describe('Navegação da Aplicação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve carregar a página inicial', async ({ page }) => {
    await expect(page).toHaveTitle(/Task Manager/i);
    await expect(page.locator('h1')).toContainText(/Dashboard|Task Manager/i);
  });

  test('deve navegar entre todas as seções', async ({ page }) => {
    // Navegar para Usuários
    await page.getByRole('link', { name: /Usuários/i }).click();
    await expect(page).toHaveURL(/.*users/);
    await expect(page.locator('h2')).toContainText(/Usuários/i);

    // Navegar para Tarefas
    await page.getByRole('link', { name: /Tarefas/i }).click();
    await expect(page).toHaveURL(/.*tasks/);
    await expect(page.locator('h2')).toContainText(/Tarefas/i);

    // Navegar para Categorias
    await page.getByRole('link', { name: /Categorias/i }).click();
    await expect(page).toHaveURL(/.*categories/);
    await expect(page.locator('h2')).toContainText(/Categorias/i);    

    // Voltar para Dashboard
    await page.getByRole('link', { name: /dashboard|home/i }).click();
    await expect(page).toHaveURL(/^(?!.*(users|categories|tasks))/);
  });

  test('deve manter navegação funcionando após reload', async ({ page }) => {
    await page.getByRole('link', { name: /Usuários/i }).click();
    await page.reload();
    await expect(page).toHaveURL(/.*users/);
  });
});