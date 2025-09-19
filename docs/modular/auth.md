# 📂 Auth Module

The `auth/` module provides authentication functionality for the application.
It follows the **layered architecture** used in other modules (controller, service, provider, etc.) to keep responsibilities separated and easy to extend.

---

## 🔑 Purpose

* Central place for **authentication logic**.
* Currently supports **Basic Authentication** with simple username/password.
* Can be extended later for **JWT, OAuth, sessions, or RBAC** without breaking other modules.

---

## 📄 Files Overview

### `auth.controller.ts`

* Handles HTTP requests related to authentication.
* Example endpoints:

    * `POST /login` → validate user credentials
    * `POST /logout` → clear user session/token

---

### `auth.model.ts`

* Defines TypeScript interfaces and data structures.
* Example: `AuthRequest` (`username`, `password`), `AuthResponse` (success message or token).

---

### `auth.provider.ts`

* **Infrastructure layer**.
* Contains low-level logic such as:

    * Extracting `Authorization` headers.
    * Base64 decoding for Basic Auth.
* Provides **middleware functions** that can be plugged into routes.

---

### `auth.service.ts`

* **Business logic layer**.
* Responsible for:

    * Validating credentials (currently static username/password check).
    * Later: can connect to `user.service` or external identity providers.

---

### `auth.repos.ts`

* **Persistence layer** (optional).
* Useful if sessions, refresh tokens, or login audit logs need to be stored.
* Empty for now, but kept for future growth.

---

### `auth.routes.ts`

* Defines routes for authentication endpoints.
* Maps HTTP methods and paths to controller functions.
* Example:

    * `/login` → `AuthController.login()`
    * `/logout` → `AuthController.logout()`

---

## ⚙️ How it fits in

* Routes (`auth.routes.ts`) → Controllers (`auth.controller.ts`) → Services (`auth.service.ts`) → Providers (`auth.provider.ts`)
* This separation ensures:

    * **Controllers** = handle HTTP requests/responses.
    * **Services** = contain pure authentication logic.
    * **Providers** = handle technical details (headers, middleware).
    * **Repositories** = optional persistence if needed.

---

## 🚀 Next Steps

* Implement Basic Auth middleware in `auth.provider.ts`.
* Call `AuthService.validateCredentials()` to check username/password.
* Protect secured routes by plugging middleware into router.
