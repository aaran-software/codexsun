import { expect, test } from '@playwright/test'

test('home page renders the public suite baseline', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: 'Business software, made to work together.',
    })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Login' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open dashboard' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sites' })).toBeVisible()
  await expect(page.getByText(/^v 1\.0\.\d{3}$/)).toBeVisible()
})
