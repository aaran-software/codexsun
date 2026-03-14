# Codexsun - Security Documentation

## Authentication

- JWT tokens with configurable expiry and refresh tokens
- Secrets must come from environment configuration
- JWT bearer middleware is enabled in the backend pipeline
- Refresh token rotation is enforced on refresh and logout
- Portal-based login checks are enforced for customer, vendor, and admin roles

## Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## CORS

- Controlled through `Cors:AllowedOrigins`
- Default local frontend origin is `http://localhost:7002`
- Credentials are allowed where required by auth flows

## Rate Limiting

- `PerIp`: 100 requests per 60 seconds
- `PerUser`: 50 requests per 60 seconds
- HTTP 429 is returned on limit exceed

## Audit Logging

- `AuditLog` tracks login, failed login, password change, and admin actions
- Captures user, IP, user agent, entity type, and entity id where available

## Error Monitoring

- `ErrorMonitoringMiddleware` captures unhandled exceptions
- Slow requests are logged as warnings
- `SystemError` stores exception details for later review

## Environment Security

- Separate development, staging, and production configuration
- Sensitive values must not be committed in source