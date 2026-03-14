# Codexsun - Security Documentation

## Authentication

- JWT tokens with configurable expiry and refresh tokens
- Secrets must come from environment configuration
- JWT bearer middleware is enabled in the backend pipeline
- Refresh token rotation is enforced on refresh and logout
- Portal-based login checks are enforced for customer, vendor, and admin roles
- Passwords are stored only as BCrypt password hashes
- JWT access tokens include `UserId`, `Username`, `Role`, and `Permissions` claims
- Frontend session restore exchanges the stored refresh token for a fresh access token during app startup

## Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## CORS

- Controlled through `Cors:AllowedOrigins`
- Default local frontend origin is `http://localhost:7023`
- Credentials are allowed where required by auth flows

## Frontend Session Handling

- `cxstore` manages session state centrally in `src/state/authStore.ts`
- Authenticated frontend requests attach `Authorization: Bearer {token}`
- Frontend request handling retries a `401` once after refresh-token exchange
- Failed refresh attempts clear local auth state and return the user to login
- The auth screen now supports both sign-in and self-service signup against the existing backend auth endpoints
- Google sign-in on the frontend is configuration-driven via `VITE_GOOGLE_AUTH_URL`; without that provider URL the button remains a non-authenticating entry point and does not bypass local auth

## Rate Limiting

- Global rate limiting is enforced for all requests
- Anonymous traffic is partitioned per IP and defaults to `100` requests per `60` seconds
- Authenticated traffic is partitioned per user and defaults to `50` requests per `60` seconds
- HTTP 429 is returned on limit exceed

## Audit Logging

- `AuditLog` tracks login, failed login, password change, and admin actions
- Captures user, IP, entity type, and entity id where available
- Auth module currently records register, login, failed login, refresh, and logout actions
- Auth audit IP capture honors `X-Forwarded-For` before falling back to the direct connection address

## Security Validation

- `cxtest/AuthSecurityTests` covers password hashing, JWT validation, login attack resistance, refresh-token rotation, authorization, rate limiting, and audit logging
- Security tests validate SQL injection rejection, XSS rejection, token tampering rejection, expired-token rejection, and brute-force throttling
- The current security regression suite passes with `30` tests

## Authorization Policies

- `AdminAccess` requires role `Admin`
- `VendorAccess` requires role `Vendor`
- `CustomerAccess` requires role `Customer`
- Frontend route guards support authenticated and role-based route restriction
- All `/common/*` master-data mutation and lookup endpoints are currently protected with `AdminAccess`

## Common Master Data Validation

- Common master requests are validated with FluentValidation before controller actions continue
- Duplicate names/codes are rejected at both service level and database index level
- Hierarchical foreign keys such as Country/State/District/City relationships are verified before create or update operations succeed
- Destination records require at least one location reference (`CountryId` or `CityId`)

## Error Monitoring

- `ErrorMonitoringMiddleware` captures unhandled exceptions
- Slow requests are logged as warnings
- `SystemError` stores exception details for later review

## Environment Security

- Separate development, staging, and production configuration
- Sensitive values must not be committed in source
- Local infrastructure credentials are fixed for development bootstrap only and must be rotated outside development
- Local development also seeds a bootstrap admin account for initial access; that credential must be changed or disabled outside development
- External identity provider URLs such as `VITE_GOOGLE_AUTH_URL` must be environment-specific and should point only to trusted OAuth entry points
