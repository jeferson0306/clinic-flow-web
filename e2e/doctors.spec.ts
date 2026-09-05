import { test, expect } from "@playwright/test";

/** Same live-backend requirement as e2e/auth.spec.ts. */

// See patients.spec.ts's identical helper for why this escaping matters.
function exact(text: string): RegExp {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

function uniqueCpf(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));
  const digit = (nums: number[]) => {
    let sum = 0;
    let weight = nums.length + 1;
    for (const n of nums) sum += n * weight--;
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  const d1 = digit(base);
  const d2 = digit([...base, d1]);
  const digits = [...base, d1, d2];
  return `${digits.slice(0, 3).join("")}.${digits.slice(3, 6).join("")}.${digits.slice(6, 9).join("")}-${digits.slice(9).join("")}`;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/utilizador|username|usuario/i).fill("admin");
  await page.getByLabel(/senha|password|contraseña/i).fill("admin123");
  await page.getByRole("button", { name: /entrar|sign in|iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("registers, edits (without touching CPF), and deletes a doctor", async ({ page }) => {
  await page.goto("/dashboard/doctors");

  const fullName = `Dr. E2E ${Date.now()}`;
  await page.getByRole("button", { name: /novo médico|new doctor|nuevo médico/i }).click();
  await page.getByLabel(/nome completo|full name|nombre completo/i).fill(fullName);
  await page.getByLabel(/^cpf$/i).fill(uniqueCpf());
  await page.getByLabel(/email|correio|correo/i).fill(`${Date.now()}@example.com`);
  await page.getByLabel(/specialty|especialidade|especialidad/i).fill("Cardiology");
  await page.getByLabel(/licence|license|licença|crm|colegiado/i).fill(`LIC-${Date.now()}`);
  await page.getByRole("button", { name: /^criar$|^create$|^crear$/i }).click();
  await expect(page.getByText(fullName)).toBeVisible();

  const row = page.getByRole("row", { name: exact(fullName) });
  await row.getByTitle(/edit|editar/i).click();
  await expect(page.getByLabel(/^cpf$/i)).toHaveCount(0);
  await page.getByLabel(/specialty|especialidade|especialidad/i).fill("Cardiology and Vascular Surgery");
  await page.getByRole("button", { name: /^save$|^salvar$|^guardar$/i }).click();
  await expect(page.getByText("Cardiology and Vascular Surgery")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("row", { name: exact(fullName) }).getByTitle(/delete|excluir|eliminar/i).click();
  await expect(page.getByText(fullName)).not.toBeVisible();
});
