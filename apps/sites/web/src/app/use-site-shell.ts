import { useOutletContext } from 'react-router-dom'
import type { SiteHealth, SitePayload } from '@sites/lib/api'

type SiteShellContext = {
  payload: SitePayload | null
  health: SiteHealth | null
}

function useSiteShell() {
  return useOutletContext<SiteShellContext>()
}

export { useSiteShell }
