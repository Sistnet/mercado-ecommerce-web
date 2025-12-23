# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` houses the Next.js App Router routes, with layout groups like `(auth)` and `(main)` plus the dynamic tenant segment `[tenant]`.
- `src/components/` contains UI primitives (`ui/`), feature components (`features/`), layouts (`layouts/`), and providers (`providers/`).
- `src/lib/` includes API clients, Redux store setup, tenant utilities, and shared helpers.
- `src/i18n/` and `src/types/` hold localization resources and shared types.
- `public/` is for static assets; global styles live in `src/app/globals.css`.
- `middleware.ts` injects the `x-tenant` header for multi-tenant routing.

## Build, Test, and Development Commands
- `yarn dev` (or `npm run dev`) starts the local dev server at `http://localhost:3000`.
- `yarn build` creates a production build with Next.js.
- `yarn start` serves the production build locally.
- `yarn lint` runs ESLint using the Next.js config.

## Coding Style & Naming Conventions
- TypeScript + React (Next.js App Router) with Tailwind CSS v4 for styling.
- Use 2-space indentation, single quotes, and semicolons to match existing files.
- Prefer kebab-case filenames (e.g., `product-card.tsx`) and PascalCase component names.
- Use the path alias `@/*` for imports (configured in `tsconfig.json`).

## Testing Guidelines
- No automated test runner is configured yet (`package.json` has no `test` script).
- For now, rely on manual verification and `yarn lint`.
- If you add tests, keep them close to source as `*.test.ts(x)` and add a `test` script.

## Commit & Pull Request Guidelines
- Follow the existing commit style: `feat: ...`, `doc: ...`, `fix: ...` (Conventional Commits).
- PRs should include a clear summary, linked issue/ticket if available, and screenshots or recordings for UI changes.
- Note any manual testing performed (e.g., “checked `/[tenant]` routes in dev”).

## Configuration & Multi-Tenant Tips
- Development resolves tenants via path (`/loja1`), production via subdomain.
- Set `NEXT_PUBLIC_API_URL` for API calls; tenant-aware paths are handled in `src/lib/api/`.
