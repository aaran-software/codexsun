import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { ShellRoutes } from './app/shell/shell-routes'

describe('App', () => {
  it('renders the host shell navigation and workspace page', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <ShellRoutes />
      </MemoryRouter>,
    )

    expect(html).toContain('Workspace Registry')
    expect(html).toContain('Cxsun is now the only host entrypoint.')
    expect(html).toContain('Sites')
  })
})
