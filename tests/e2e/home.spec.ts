import { expect, test } from '@playwright/test'

test('home page renders the host workspace baseline', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: 'Cxsun is now the only host entrypoint.',
    }),
  ).toBeVisible()
  await expect(page.getByText(/Workspace Registry/i)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open sites' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'View external registry' })).toBeVisible()
})
