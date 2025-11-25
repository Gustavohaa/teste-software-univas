import { test, expect } from '@playwright/test'
test.describe('Usuários', () => {
  
  test('navega para Usuários e lista itens do backend', async ({ page }) => {
    await page.goto('/') // Dashboard
    await page.getByRole('link', { name: 'Usuários' }).click()
    // Título da seção
    await expect(page.getByRole('heading', { name: /Usuários/i })).toBeVisible()
    // Emails semeados (seed do backend)
    await expect(page.getByText(/john.doe@example.com/i)).toBeVisible()
    await expect(page.getByText(/jane.smith@example.com/i)).toBeVisible()
  });
});

test('cria usuário e aparece na lista', async ({ page }) => {
    await page.goto('/users')
    await page.getByRole('button', { name: /Adicionar Usuário/i }).click()
    const uniqueEmail = `aluno.${Date.now()}@ex.com`
    await page.getByLabel('Nome:').fill('Aluno E2E')
    await page.getByLabel('Email:').fill(uniqueEmail)
    await page.getByRole('button', { name: /Criar/i }).click()
      // Aguarda recarga da lista
    await expect(page.getByText(uniqueEmail)).toBeVisible()
  });

test('atualiza usuário e reflete na lista', async ({ page }) => {
  await page.goto('/users')

  // Primeiro, cria um usuário temporário para atualizar
  await page.getByRole('button', { name: /Adicionar Usuário/i }).click()
  const originalName = 'User Original'
  const originalEmail = `original.${Date.now()}@ex.com`
  await page.getByLabel('Nome:').fill(originalName)
  await page.getByLabel('Email:').fill(originalEmail)
  await page.getByRole('button', { name: /Criar/i }).click()

  // Aguarda o usuário aparecer na lista
  await expect(page.getByText(originalEmail)).toBeVisible()

  // Clica no botão Editar do usuário recém-criado
  const row = page.locator('tr', { has: page.getByText(originalEmail) })
  await row.getByRole('button', { name: /Editar/i }).click()

  // Verifica que o formulário aparece com dados preenchidos
  await expect(page.getByLabel('Nome:')).toHaveValue(originalName)
  await expect(page.getByLabel('Email:')).toHaveValue(originalEmail)

  // Verifica que o botão mudou para "Atualizar"
  await expect(page.getByRole('button', { name: /Atualizar/i })).toBeVisible()

  // Atualiza o nome para um valor único
  const updatedName = `Updated User ${Date.now()}`
  await page.getByLabel('Nome:').fill(updatedName)

  // Clica em Atualizar
  await page.getByRole('button', { name: /Atualizar/i }).click()

  // Verifica que o nome atualizado aparece na tabela
  await expect(page.getByText(updatedName)).toBeVisible()
  // Verifica que ainda mostra o mesmo email
  await expect(page.getByText(originalEmail)).toBeVisible()
})

test('exclui usuário e remove da lista', async ({ page }) => {
  await page.goto('/users')

  // Primeiro, cria um usuário temporário para excluir
  await page.getByRole('button', { name: /Adicionar Usuário/i }).click()
  const tempEmail = `temp.${Date.now()}@ex.com`
  await page.getByLabel('Nome:').fill('Temp User')
  await page.getByLabel('Email:').fill(tempEmail)
  await page.getByRole('button', { name: /Criar/i }).click()

  // Aguarda o usuário aparecer na lista
  await expect(page.getByText(tempEmail)).toBeVisible()

  // Prepara para aceitar o diálogo de confirmação
  page.on('dialog', dialog => dialog.accept())

  // Clica no botão Excluir do usuário temporário
  const row = page.locator('tr', { has: page.getByText(tempEmail) })
  await row.getByRole('button', { name: /Excluir/i }).click()

  // Aguarda um pouco para a exclusão processar
  await page.waitForTimeout(500)

  // Verifica que o usuário não aparece mais na lista
  await expect(page.getByText(tempEmail)).not.toBeVisible()
});
