import { test, expect } from "@playwright/test";

// Row/button accessible names are matched with a dynamically-built RegExp
// below — needed since names are unescaped when built from a plain string.
function exact(text: string): RegExp {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/utilizador|username|usuario/i).fill("admin");
  await page.getByLabel(/senha|password|contraseña/i).fill("admin123");
  await page.getByRole("button", { name: /entrar|sign in|iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("creates, edits, sorts/searches, and deletes a procedure", async ({ page }) => {
  await page.goto("/dashboard/procedures");

  const name = `E2E Procedure ${Date.now()}`;
  await page.getByRole("button", { name: /novo procedimento|new procedure|nuevo procedimiento/i }).click();
  await page.getByLabel(/^name$|^nome$|^nombre$/i).fill(name);
  await page.getByLabel(/duration|duração|duración/i).fill("30");
  await page.getByLabel(/price|preço|precio/i).fill("150");
  await page.getByRole("button", { name: /^criar$|^create$|^crear$/i }).click();
  await expect(page.getByText(name)).toBeVisible();

  // Search filters the table down to the one row.
  await page.getByPlaceholder(/search|pesquisar|buscar/i).fill(name);
  await expect(page.getByRole("row", { name: exact(name) })).toBeVisible();

  // Edit: change the name, confirm the table reflects it without a reload.
  const row = page.getByRole("row", { name: exact(name) });
  await row.getByTitle(/edit|editar/i).click();
  const newName = `${name} (updated)`;
  const nameInput = page.getByLabel(/^name$|^nome$|^nombre$/i);
  await nameInput.fill(newName);
  await page.getByRole("button", { name: /^save$|^salvar$|^guardar$/i }).click();
  await expect(page.getByText(newName)).toBeVisible();

  // Delete: accept the native confirm and verify the row is gone.
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("row", { name: exact(newName) }).getByTitle(/delete|excluir|eliminar/i).click();
  await expect(page.getByText(newName)).not.toBeVisible();
});
