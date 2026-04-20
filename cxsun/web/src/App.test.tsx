import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { ShellRoutes } from './app/shell/shell-routes'

describe('App', () => {
  it('renders the public home page', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <ShellRoutes />
      </MemoryRouter>
    )

    expect(html).toContain('Business software, made to work together.')
    expect(html).toContain('Login')
    expect(html).toContain('Dashboard')
  })

  it('renders the internal dashboard shell', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ShellRoutes />
      </MemoryRouter>
    )

    expect(html).toContain('Workspace Registry')
    expect(html).toContain('Business software, made to work together.')
    expect(html).toContain('Desk')
  })
})
