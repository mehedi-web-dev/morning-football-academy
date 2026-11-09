<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Morning Football Academy

Dark football-club marketing site built with Next.js App Router, React 19, Tailwind v4, and HeroUI v3.

## Stack and layout

- App Router lives in `src/app`; `src/app/page.tsx` composes `HeroSection`, `ClubStats`, `UpcomingMatches`, and `SquadSection` from `src/components/home`. `src/app/layout.tsx` owns the Navbar, Footer, fonts, metadata, and `globals.css`.
- Navbar/Footer links target `/#about`, `/#players`, `/#fixtures`, `/#results`, `/#news`, `/#gallery`, and `/#join`. Most of those section IDs do not exist yet, so add the matching `id` when building each section instead of assuming the link works.
- `tsconfig.json` maps `@/*` to the repo root (`./*`), not `src/`. Use relative imports (as existing code does) or `@/src/...`; `@/components/...` will not resolve.
- UI uses `@heroui/react` components and `lucide-react` icons. Theme tokens and keyframes are in `src/app/globals.css`; the recurring palette is neutral near-black backgrounds (`#0A0A0A`, panels `#18181B`/`#202024`), lime accent `#B9F66B`, muted text `#A4B0A8`, with uppercase headings and wide tracking.
- `README.md` still describes the old `app/page.tsx` layout. Trust `src/`.

## Commands

- `npm run dev` — Turbopack dev server.
- `npm run build` — production build.
- `npm run lint` — ESLint flat config (`eslint`, not the removed `next lint`).
- `npx tsc --noEmit` — typecheck; there is no `typecheck` script.
- No test runner or test files are configured. Verify with `npm run lint` and `npx tsc --noEmit` instead of inventing a test command.
- Use npm (`package-lock.json` is the only lockfile).

## Toolchain quirks

- Tailwind v4 is wired through the `@tailwindcss/turbopack` loader in `next.config.ts` (`turbopack.rules["*.css"]`), not PostCSS. There is no `postcss.config.*`; keep the loader rule.
- `cacheComponents: true` and `partialPrefetching: true` are enabled, so pages prerender. Uncached data access (`fetch`, `connection()`) must sit under `<Suspense>` or be marked `"use cache"`, or verification will fail. See `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`.
- `experimental.agentFeedback` is enabled. `next dev` may add or restore managed `AGENTS.md` blocks; keep the marker blocks and commit them.
- `images.remotePatterns` contains only the placeholder hostname `"***"`. Use local assets under `public/images/`, or update the config before using remote `next/image` sources.
- If `npm run build` fails with `Can't resolve '@vercel/turbopack-next/internal/font/google/font'`, the `next/font/google` download timed out (`fonts.gstatic.com`). Retry with network access; lint and typecheck do not need it.
