# Cursor Prompt Templates (FarmApp)
**Date:** 2025-09-11

Use these prompts inside Cursor to generate code directly from our specs.
Reference sections by name so Cursor grounds outputs to the docs.

---

## 0) Global Context Prompt (pin this in Cursor)
You are generating code for **FarmApp**, a mobile‑first, offline‑first app for Palestinian sheep farms.
Use these inputs as the source of truth (assume they exist in the workspace):
- `System_Technical_Spec.md` (master)
- `Backend_Implementation_Guide.md`
- `Frontend_Implementation_Guide.md`
- `Mobile_Implementation_Guide.md`
- `openapi.yaml`
- `API_Guide.md`
- `Business_Requirements_Document.md`
Follow the sync contract (LWW), farm scoping with `X-Farm-Id`, local SMS OTP, and best‑effort costing.

---

## 1) Backend – Generate Controllers & DTOs (Auth + Farms)
Implement `/auth/otp/request` and `/auth/otp/verify` and `/farms` + `/farms/{id}/members` per **openapi.yaml** and **System_Technical_Spec §3, §6**.
- Create Spring controllers, request/response DTOs, service interfaces, and basic tests.
- Stubs only, no provider keys.
- Return shapes must match OpenAPI; include `X-Farm-Id` where required.
- Add TODOs for Redis OTP store and rate limiting.

Prompt:
```
Read openapi.yaml and System_Technical_Spec §3 & §6.
Generate Spring Boot controllers, DTOs, and services for Auth OTP and Farms endpoints.
Include unit tests (JUnit5) with mocks. No business logic yet.
```

## 2) Backend – Sync Endpoints
Implement `/farms/{id}/sync/pull` and `/farms/{id}/sync/push` per **System_Technical_Spec §6** and **API_Guide.md**.
- Pull returns: changed entities + tombstones + serverTime.
- Push accepts outbox `changes`, returns id mappings and conflicts (LWW).

Prompt:
```
Implement sync endpoints for pull/push following System_Technical_Spec §6 and API_Guide.md.
Create request/response models, controllers, and services with TODOs for repositories.
Return realistic mocked payloads matching the contract.
```

## 3) Backend – Domain Modules Skeleton
Create modules for: Animals, Breeding, Health, Feeding & Weight, Milking & Sales, Inventory, Insights, Reports, Notifications.
- Entities with `farmId`, `updatedAt`, `@Version` where needed.
- Repositories, services, controllers (empty methods with TODOs).
- Flyway migration V1 baseline tables.

Prompt:
```
Using System_Technical_Spec §4 & §7 and Backend_Implementation_Guide, scaffold domain modules:
entities, repositories, services, controllers. Add Flyway V1 with core tables.
```

## 4) Backend – Quartz Jobs
Jobs: `reminders:dispatch` (*/10m), `etl:metric_snapshots` (00:05 UTC), `insights:impact_scan` (00:45), `costing:backfill` (nightly).
- Quartz configs (JDBC store), schedulers, empty execute() with TODOs.
Prompt:
```
Create Quartz configuration and 4 scheduled jobs as per System_Technical_Spec §8 and Backend Guide §7.
Include cron expressions, job keys, and idempotent patterns.
```

## 5) Web – App Shell & Routing
- Next.js (App Router), TS, Tailwind, next-intl scaffolding.
- Routes from **Frontend_Implementation_Guide §3**.
Prompt:
```
Generate a Next.js App Router project with TS, Tailwind, next-intl, and routes per Frontend_Implementation_Guide §3.
Include a layout with RTL toggle and a farm switcher component.
```

## 6) Web – API Client & Guards
- OpenAPI client, Axios wrapper with JWT + `X-Farm-Id` interceptor.
- Route guards for roles; 401/403 handling.
Prompt:
```
Create an API client from openapi.yaml and an Axios wrapper with JWT and X-Farm-Id interceptors.
Add route guards by role and error handling (401→login, 403→no-access) per FE Guide §2 & §4.
```

## 7) Mobile – Local DB & Outbox
- WatermelonDB models for animals, events, weights, yields, sales, reminders, outbox.
- Sync worker (BackgroundFetch).
Prompt:
```
Implement WatermelonDB schemas and a sync worker that pushes the outbox and pulls delta per System_Technical_Spec §6 and Mobile Guide §2–§3.
```

## 8) Mobile – Screens
- Home actions, Animals list/search, Animal profile (timeline), Tasks/Reminders, Simple Reports.
Prompt:
```
Generate React Native screens per Mobile Guide §4 with Arabic RTL support and numeric keypad inputs.
```

## 9) Reports & Exports
- Web tables (virtualized), CSV/XLSX export buttons.
- Backend endpoints `/reports/export` (stub).
Prompt:
```
Implement web report pages with virtualized tables and export buttons.
Add backend stub for /reports/export returning CSV/XLSX per API_Guide.md.
```

## 10) Insights MVP
- Backend: service interface for uplift, DiD, change-point, lag; entity skeletons.
- Web: Insights list with confidence badges.
Prompt:
```
Scaffold Insights module per System_Technical_Spec §7.8:
entities, services (interfaces), and a web page rendering cards with confidence badges.
```

## 11) Super-Admin Ops
- Web `/ops` pages: create farm, create user, assign role, impersonate (view-only).
- Backend: endpoints guarded by Super-Admin.
Prompt:
```
Generate Ops console pages and backend endpoints with role guards and audit logging stubs per System_Technical_Spec §3 and FE Guide §11.
```

## 12) Tests & Pipelines
- Add unit tests and a minimal Bitbucket pipeline (lint/test/build).

Prompt:
```
Add unit tests for key modules and a Bitbucket pipeline file to build/test.
```
