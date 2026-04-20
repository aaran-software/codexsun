import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import type { AppManifest } from '@codexsun/core'
import type { PlatformRouteDefinition } from '../../../cxsun/src/platform/http/routes'
import { sitePortfolioContent } from '../shared/site-content'

const sitesAppManifest: AppManifest = {
  id: 'sites',
  name: 'Sites',
  kind: 'domain',
  description:
    'Plugin website app with app-owned site behavior mounted through the cxsun host.',
  entry: 'cxsun',
  surfaces: {
    web: true,
    internalApi: true,
    externalApi: true,
  },
}

type ContactSubmission = {
  id: string
  name: string
  email: string
  message: string
  submittedAt: string
}

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  message: z.string().trim().min(10).max(1200),
})

function createSitesApiRoutes(startedAt: Date): {
  internalRoutes: PlatformRouteDefinition[]
  externalRoutes: PlatformRouteDefinition[]
} {
  const contactInbox: ContactSubmission[] = []

  const healthRoute: PlatformRouteDefinition = {
    method: 'GET',
    path: '/api/external/sites/health',
    summary: 'External health for the sites plugin app.',
    handler() {
      return {
        statusCode: 200,
        payload: {
          app: sitesAppManifest.id,
          status: 'ok',
          startedAt: startedAt.toISOString(),
          uptimeSeconds: Math.floor((Date.now() - startedAt.getTime()) / 1000),
          contactsReceived: contactInbox.length,
        },
      }
    },
  }

  return {
    internalRoutes: [
      {
        method: 'GET',
        path: '/api/internal/sites/summary',
        summary: 'Internal status and content summary for the sites plugin app.',
        handler() {
          return {
            statusCode: 200,
            payload: {
              app: sitesAppManifest,
              navItems: sitePortfolioContent.navItems,
              contactsReceived: contactInbox.length,
            },
          }
        },
      },
    ],
    externalRoutes: [
      healthRoute,
      {
        method: 'GET',
        path: '/api/external/sites/site',
        summary: 'External site payload for the sites plugin app.',
        handler() {
          return {
            statusCode: 200,
            payload: {
              manifest: sitesAppManifest,
              content: sitePortfolioContent,
            },
          }
        },
      },
      {
        method: 'POST',
        path: '/api/external/sites/contact',
        summary: 'External contact submission endpoint for the sites plugin app.',
        handler({ body }) {
          const parsedBody = contactSchema.safeParse(body)

          if (!parsedBody.success) {
            return {
              statusCode: 400,
              payload: {
                error: 'Invalid contact payload.',
                issues: parsedBody.error.issues.map((issue) => issue.message),
              },
            }
          }

          const submission: ContactSubmission = {
            id: randomUUID(),
            name: parsedBody.data.name,
            email: parsedBody.data.email,
            message: parsedBody.data.message,
            submittedAt: new Date().toISOString(),
          }

          contactInbox.push(submission)

          return {
            statusCode: 202,
            payload: {
              status: 'accepted',
              submissionId: submission.id,
            },
          }
        },
      },
    ],
  }
}

export { createSitesApiRoutes, sitesAppManifest }
