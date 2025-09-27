import { test, expect } from '@playwright/test'

const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@example.com'
const adminPass = process.env.E2E_ADMIN_PASS || 'Passw0rd!'
const financeEmail = process.env.E2E_FIN_EMAIL || 'finance@example.com'
const financePass = process.env.E2E_FIN_PASS || 'Passw0rd!'

async function login(page, email: string, password: string) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /login/i }).click()
}

test.describe('Dual-control approvals', () => {
  test('Admin creates points adjust approval, finance approves & executes', async ({ page, context }) => {
    // Admin requests points adjust
    await login(page, adminEmail, adminPass)
    await page.waitForURL(/admin\/dashboard/)

    // Hit the API to create approval (simulate UI call)
    const resp = await page.request.post('/api/admin/points/adjust', {
      data: { userId: 'test-user-id', amount: 5, reason: 'E2E test' }
    })
    expect(resp.status()).toBe(202)

    // Finance approves
    const financePage = await context.newPage()
    await login(financePage, financeEmail, financePass)
    await financePage.waitForURL(/admin\/dashboard/)
    await financePage.getByRole('link', { name: 'Approvals' }).click()
    await expect(financePage.getByRole('heading', { name: 'Approvals' })).toBeVisible()

    // Approve first pending and execute
    const approveButtons = financePage.getByRole('button', { name: /approve/i })
    await approveButtons.first().click()
    const executeButtons = financePage.getByRole('button', { name: /execute/i })
    await executeButtons.first().click()
  })
})
