import { test, expect } from "@playwright/test";

/** Same live-backend requirement as e2e/auth.spec.ts. */

/**
 * A fresh, check-digit-valid CPF every run — brdoc validates the real
 * mod-11 algorithm against the backend, so a fixed literal would only pass
 * once; the second run collides with V1__create_patients.sql's own unique
 * constraint on cpf and gets a 409 instead of exercising the happy path.
 */
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

test("registers a patient and lists them with a masked CPF", async ({ page }) => {
  await page.goto("/dashboard/patients");

  await page.getByRole("button", { name: /novo paciente|new patient|nuevo paciente/i }).click();

  const fullName = `E2E Patient ${Date.now()}`;
  await page.getByLabel(/nome completo|full name|nombre completo/i).fill(fullName);
  await page.getByLabel(/^cpf$/i).fill(uniqueCpf());
  await page.getByLabel(/email|correio|correo/i).fill(`${Date.now()}@example.com`);
  await page.getByLabel(/cep|postcode|código postal/i).fill("01310-200");

  await page.getByRole("button", { name: /^criar$|^create$|^crear$/i }).click();

  await expect(page.getByText(fullName)).toBeVisible();
  const row = page.getByRole("row", { name: new RegExp(fullName) });
  await expect(row.getByText(/\*{9}\d{2}/)).toBeVisible();
});
