import { test, expect } from '@playwright/test'

const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@example.com'
const adminPass = process.env.E2E_ADMIN_PASS || 'Passw0rd!'

const financeEmail = process.env.E2E_FIN_EMAIL || 'finance@example.com'
const financePass = process.env.E2E_FIN_PASS || 'Passw0rd!'

async function adminLogin(page, email: string, password: string) {
  await page.goto('/admin/login')
  await page.locator('#admin-email').fill(email)
  await page.locator('#admin-password').fill(password)
  await page.getByRole('button', { name: /access/i }).click()
}

test.describe('RBAC UI gating', () => {
  test('SUPER_ADMIN sees all admin sections', async ({ page }) => {
    await adminLogin(page, adminEmail, adminPass)
    await page.waitForURL(/admin\/dashboard/)

    // Sidebar should include Approvals and Settings
    await expect(page.getByRole('link', { name: 'Approvals' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()

    // Permissions coverage page loads
    await page.getByRole('link', { name: 'Permissions' }).click()
    await expect(page.getByRole('heading', { name: 'Permissions Coverage' })).toBeVisible()
  })

  test('Finance can access Approvals but not Settings write actions', async ({ page }) => {
    await adminLogin(page, financeEmail, financePass)
    await page.waitForURL(/admin\/dashboard/)

    await expect(page.getByRole('link', { name: 'Approvals' })).toBeVisible()
    await page.getByRole('link', { name: 'Settings' }).click()
    // Save buttons should be disabled (no settings.write) if finance lacks it
    const saveButtons = page.getByRole('button', { name: /save/i })
    await expect(saveButtons.first()).toBeDisabled()
  })
})
