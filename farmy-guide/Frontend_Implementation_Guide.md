# Frontend Implementation Guide (Web)

**Version:** 1.0

## Table of Contents
1. Tech Stack
2. Auth & Security
3. Routing & Sitemap
4. Data Fetching & State
5. UI/UX Standards
6. Tables, Charts & Exports
7. Error Handling
8. Testing & CI/CD
9. Performance Budgets
10. Accessibility & i18n
11. Ops Console (Super-Admin)

---

## 1. Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + Headless UI (RTL-ready)
- React Query (server cache) + minimal local state
- React Hook Form + Zod
- Charts: Recharts
- i18n: `next-intl` (AR/EN)

## 2. Auth & Security
- OTP login; JWT stored in memory (fallback HttpOnly cookie if needed). Refresh silently.
- Always send `X-Farm-Id` header (from farm selector).
- Guard routes by role; hide links user cannot access.

## 3. Routing & Sitemap
- `/login`
- `/switch-farm`
- `/dashboard`
- `/animals` → `/:id` (tabs: Breeding, Health, Weight, Milk, Sales)
- `/breeding`, `/health`, `/feeding`, `/milk`, `/sales`
- `/reports`, `/insights`
- `/settings` (members, notifications, tag config)
- `/ops` (Super-Admin: create farms/users, assign roles, impersonate view-only)

## 4. Data Fetching & State
- Use OpenAPI-generated client. Wrap base client with interceptors (JWT, farm header, 401→relogin).
- React Query: sensible stale times; query keys include `farmId`. Mutations invalidate relevant queries.

## 5. UI/UX Standards
- Arabic RTL toggle; direction set at `<html dir="rtl">`.
- Forms: numeric keypad for weights/prices; minimal typing (dropdowns, chips).
- Mobile-friendly breakpoints; big action buttons.

## 6. Tables, Charts & Exports
- Virtualized tables for 2k+ rows; column pinning, search by tag/RFID.
- Export CSV/XLSX via `/reports/export`.
- Charts: lightweight KPI charts (small multiples).

## 7. Error Handling
- Global error boundary; toast for non-blocking errors; inline field errors for forms.
- 401: redirect to login; 403: no-access page.

## 8. Testing & CI/CD
- Unit: Vitest + RTL. E2E: Playwright (smoke).
- Bitbucket Pipeline: lint/type-check/test/build → App Platform deploy.

## 9. Performance Budgets
- LCP < 2.5s broadband. Bundle splitting; cache headers.
- Keep each page < 200KB JS when possible.

## 10. Accessibility & i18n
- Keyboard focus management; ARIA labels; color contrast checked.
- `next-intl` namespaces per page; RTL styles verified.

## 11. Ops Console (Super-Admin)
- Pages to create farms/users, assign roles, view audit log, impersonate view-only.
