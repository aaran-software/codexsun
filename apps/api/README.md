# API App

`apps/api` owns shared application API composition.

Rules:

- internal routes are for first-party app-to-app communication
- external routes are for third-party or partner software connecting to this application
- app-specific APIs register into this app instead of exposing disconnected host servers
