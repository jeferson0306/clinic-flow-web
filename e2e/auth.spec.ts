import { test, expect } from "@playwright/test";

/**
 * Needs a real clinic-flow backend reachable at CLINIC_FLOW_API_URL (see
 * .env.local) with the two seeded demo accounts — these are integration
 * tests against the actual API, not mocks, matching the backend's own
 * "verify against the real thing" discipline. Run `./mvnw quarkus:dev` in
 * ../clinic-flow before `pnpm test:e2e`.
 */

test.describe("authentication", () => {
  test("redirects an unauthenticated visitor to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("rejects invalid credentials with an inline error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/utilizador|username|usuario/i).fill("admin");
    await page.getByLabel(/senha|password|contraseña/i).fill("wrong-password");
    await page.getByRole("button", { name: /entrar|sign in|iniciar sesión/i }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs in with the seeded admin account and reaches the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/utilizador|username|usuario/i).fill("admin");
    await page.getByLabel(/senha|password|contraseña/i).fill("admin123");
    await page.getByRole("button", { name: /entrar|sign in|iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/admin/i).first()).toBeVisible();
  });

  test("logging out returns to /login and blocks the dashboard again", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/utilizador|username|usuario/i).fill("admin");
    await page.getByLabel(/senha|password|contraseña/i).fill("admin123");
    await page.getByRole("button", { name: /entrar|sign in|iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("button", { name: /sair|sign out|cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
