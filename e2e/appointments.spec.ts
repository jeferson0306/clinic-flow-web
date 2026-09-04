import { test, expect } from "@playwright/test";

/**
 * Regression test for a real bug: the Combobox used for patient/doctor/
 * procedure pickers lives inside a Radix Dialog, and Dialog's own focus
 * trap used to steal focus from the search input the instant the popover
 * opened — typing right after opening landed nowhere until the user
 * clicked the field a second time. See components/ui/combobox.tsx.
 */
test.describe("appointment scheduling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/utilizador|username|usuario/i).fill("admin");
    await page.getByLabel(/senha|password|contraseña/i).fill("admin123");
    await page.getByRole("button", { name: /entrar|sign in|iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("the patient combobox accepts keyboard input immediately on open", async ({ page }) => {
    await page.goto("/dashboard/appointments");
    await page.getByRole("button", { name: /agendar consulta|schedule appointment|agendar consulta/i }).click();

    const dialog = page.getByRole("dialog");
    const patientTrigger = dialog.getByRole("button").nth(1);
    await patientTrigger.click();

    const searchInput = dialog.getByPlaceholder(/search|pesquisar|buscar/i);
    await expect(searchInput).toBeFocused();

    // Typing must be reflected in the input — this is exactly what silently
    // failed before the fix (focus stayed on the trigger button).
    await page.keyboard.type("zzz-no-such-patient");
    await expect(searchInput).toHaveValue("zzz-no-such-patient");
  });
});
