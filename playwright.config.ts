import type { PlaywrightTestConfig } from '@playwright/test'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 5000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  webServer: process.env.E2E_EXTERNAL ? undefined : {
    command: 'NEXT_PUBLIC_E2E=1 npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  globalSetup: './tests/global-setup.ts',
}

export default config
