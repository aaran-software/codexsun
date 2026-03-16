# Frontend Structure (React + Vite)

## Directory Breakdown

- **/src/pages**: Contains top-level route views.
  - `Home.tsx`, `About.tsx`
  - Catalog: `CategoryPage.tsx`, `SearchPage.tsx`, `ProductPage.tsx`
  - Flow: `CartPage.tsx`, `CheckoutPage.tsx`, `OrderSuccessPage.tsx`
  - User: `AccountPage.tsx`, `Login.tsx`, `Dashboard.tsx`, `WishlistPage.tsx`
  - Vendor: `VendorStorePage.tsx`
  - Static: `Contact.tsx`, `Services.tsx`
  - `/admin`: Specialized admin dashboards.

- **/src/components**: Separated by feature-sets for reusability.
  - Core Logic: `cart/`, `checkout/`, `product/`
  - Global/Layout: `global/`, `layout/`, `blocks/`
  - Elements: `ui/`, `forms/`, `media/`, `table/`, `animate/`, `lookups/`

- **/src/api**: Dedicated services representing backend controllers mapping HTTP client calls.
  - e.g. `apiClient.ts`, `httpClient.ts` for base setups.
  - Services: `authApi`, `productApi`, `inventoryApi`, `salesApi`, `vendorApi`, `shippingApi`, `mediaApi`, etc.

- **/src/routes**: Application routing configuration.
  - `router.tsx` defines standard browser routes (`/`, `/search`, `/cart`, `/checkout`, `/account`).

## API Connection Status
- **Connected**: The vast majority of frontend pages have matching API service files (`api/` layer has 25 files perfectly bridging the 32 backend modules). For example, `CartPage` utilizes `salesApi`, `ProductPage` relies on `productApi` and `brandApi`/`colourApi`.
- **Status**: Excellent frontend-to-backend alignment via domain-based splitting.
