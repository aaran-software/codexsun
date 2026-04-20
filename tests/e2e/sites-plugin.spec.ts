import { expect, test } from '@playwright/test'

test('sites plugin renders through the cxsun host flow', async ({ page }) => {
  await page.goto('/sites')

  await expect(
    page.getByRole('heading', { name: 'Structured websites for serious businesses.' }),
  ).toBeVisible()
  await expect(page.getByText('Backend health', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'Contact' }).click()
  await expect(page.getByRole('heading', { name: 'Start the conversation.' })).toBeVisible()

  await page.getByLabel('Name').fill('Studio Client')
  await page.getByLabel('Email').fill('client@example.com')
  await page
    .getByLabel('Message')
    .fill('We need a portfolio launch site with a maintainable backend handoff.')
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.getByText('Message submitted successfully.')).toBeVisible()
})
