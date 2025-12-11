# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
yarn dev      # Start development server (localhost:3000)
yarn build    # Production build
yarn lint     # Run ESLint
yarn start    # Start production server
```

## Multi-Tenant Architecture

This is a multi-tenant e-commerce web application. Tenant resolution works differently based on environment:

- **Production**: Tenant is extracted from subdomain (`loja1.mercancy.com.br` → tenant: `loja1`)
- **Development**: Tenant is extracted from URL path (`localhost:3000/loja1` → tenant: `loja1`)

Key files:
- `middleware.ts` - Next.js middleware that sets `x-tenant` header from subdomain/path
- `src/lib/tenant/tenant-resolver.ts` - Client-side tenant resolution logic
- `src/components/providers/tenant-provider.tsx` - Sets tenant in Redux/localStorage for `[tenant]` routes
- `src/lib/api/client.ts` - Axios client that injects tenant into API paths (`/api/v1/config` → `/loja1/api/v1/config`)

Reserved subdomains that won't be treated as tenants: `www`, `admin`, `api`, `app`, `mercado`, `hml`, `dev`

## Tech Stack

- **Framework**: Next.js 16 (App Router with React Server Components)
- **State Management**: Redux Toolkit (`src/lib/store/`)
- **UI Components**: shadcn/ui (new-york style) with Radix primitives (`src/components/ui/`)
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors for auth/tenant
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── [tenant]/        # Dynamic tenant routes (localhost dev)
│   ├── (auth/)/         # Auth layout group (login, register)
│   └── (main/)/         # Main app layout group
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── features/        # Feature-specific components
│   ├── layouts/         # Layout components
│   └── providers/       # Context providers
├── lib/
│   ├── api/             # API client and endpoints
│   ├── store/           # Redux store and slices
│   └── tenant/          # Tenant resolution utilities
└── types/               # TypeScript type definitions
```

## State Management Pattern

Redux slices in `src/lib/store/slices/` handle: auth, cart, products, categories, orders, profile, address, wallet, wishlist, coupon, notifications, search, theme, banners, tenant, config.

Use typed hooks from `src/lib/store/hooks.ts`:
```typescript
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
```

## API Integration

- Base URL configured via `NEXT_PUBLIC_API_URL` env variable
- All requests automatically include tenant prefix in path and headers
- Auth token stored in localStorage/cookies under `token` key
- Guest users get a `guest_id` for cart persistence

## Image URL Helper

Images are stored in Google Cloud Storage. Use the helper to build image URLs:
`https://storage.googleapis.com/mercado-dev/img/tenants/{tenant}/{type}/{filename}`

```typescript
import { getImageUrl } from '@/lib/utils/image';

// Usage:
getImageUrl(config.base_urls, 'product', product.image);
getImageUrl(config.base_urls, 'category', category.image);
getImageUrl(config.base_urls, 'banner', banner.image);
```

Available image types: `product`, `customer`, `banner`, `category`, `review`, `notification`, `ecommerce`, `delivery_man`, `chat`, `category_banner`, `flash_sale`, `gateway`, `order`

**Important**: Always wait for `config.base_urls` to be loaded before rendering images:
```typescript
if (!config?.base_urls) return <Loading />;
```

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`)
