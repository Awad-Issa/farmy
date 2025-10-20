# System Technical Spec (Master)

**Version:** 1.0

## Table of Contents
1. Goals & Context
2. Architecture Overview
3. Security & Identity
4. Data Model
5. Tag & Color Configuration
6. Sync Contract (Offline-First)
7. Business Modules & Rules
8. Notifications & Reminders
9. Exports/Imports
10. Performance & SLOs
11. Deployment & Environments
12. Observability & Operations
13. Compliance & Privacy
14. Roadmap (Post-MVP)

---

## 1. Goals & Context
- Market: Palestinian small/medium sheep farms; limited land; **purchased feed**; family-operated.
- Languages: **Arabic + English** (RTL where Arabic).
- Devices: **Mobile-first** (primary), companion Web app (admin/reports).
- Connectivity: **Offline-first**, **sync later**.
- ID: **Numeric ear tags** (default), **RFID optional**.
- Multi-farm: user can join multiple farms; per-farm roles.
- **Super-Admin Ops**: owner/ops team can create farms/users, assign roles, support/impersonate (view-only), fully audited.
- Costing: Inventory & Costs is **always enabled best-effort** with **confidence badges**.
- Smart Insights: relate actions (shearing, supplier/ration change, protocol change, pen move) to outputs (ADG, milk, sickness, conception).

## 2. Architecture Overview
- **Backend**: Spring Boot 3 (Java 21), PostgreSQL 15+, Redis (Managed), Quartz (JDBC), Flyway, springdoc-openapi, Micrometer/Prometheus, Sentry, DigitalOcean Spaces (S3). Deploy on DO App Platform.
- **Mobile**: React Native (Expo), SQLite via WatermelonDB, background sync worker, FCM push.
- **Web**: Next.js + TypeScript, Tailwind, React Query, next-intl.
- **CI/CD**: Bitbucket Pipelines → DO Container Registry → DO App Platform.
- **Storage**: DO Spaces (private) + presigned URLs.
- **Separation of concerns**: Shared contracts (OpenAPI, sync), per-surface guides (FE/Mobile/BE).

## 3. Security & Identity
- **Auth**: Local SMS OTP (6 digits). Redis store: `{hash, attempts, expiresAt, resendAfter}`. TTL **5 min**, **max 5 attempts**, resend after **45–60s** (max 2 resends). Rate-limit per phone & IP.
- **JWT**: Access 30m, Refresh 30d. Store: web (memory/HttpOnly), mobile (SecureStore).
- **Roles**:
  - Farm-scoped: **Owner/Admin**, **Family/Worker**, **Vet**.
  - Tenant-wide: **Super-Admin Ops** (create farms/users, assign roles; impersonate view-only). **All actions audited**.
- **Farm Context**: header `X-Farm-Id` required; enforced by filter; queries always scoped by `farmId`.
- **PII**: E.164 phone normalization; optional pgcrypto; presigned URLs for object storage.
- **API Security**: Bearer JWT; rate limits on OTP endpoints; generic error messages to avoid enumeration.

## 4. Data Model
**Core Entities**
- User, Farm, **FarmMember**(role), **SuperAdmin** (role flag)
- Animal(id, farmId, tagNumber numeric, rfid?, type, sex, status, dob?, updatedAt)
- **BreedingCycle** (INS dates, checks, gestation windows, statuses) + **EventLedger** (auditable events)
- HealthEvent, Treatment, Dose, WithdrawalTrack
- Weight, FeedPlan, FeedUsage, LambFeeding(0–35d: nursing vs manufactured milk)
- MilkYield, MilkSale, SaleAnimal
- Item, Batch, Grn, Usage (optional inventory feeder for costing)
- Reminder, NotificationInbox
- MetricSnapshot, ActionEvent, InsightCard
- Tombstone(entity, entityId, deletedAt)

**Indexes**
- `(farmId, tagNumber)` unique; `(farmId, updatedAt)` for sync; `(farmId, date)` on event tables.

## 5. Tag & Color Configuration
- Farm settings: **Type ↔ Tag color map** (e.g., Ewe=Yellow, Ram=Blue, Lamb=White), **numbering format** (prefix/range per type), uniqueness rule (**per farm**; optional per type).
- UI warns on mismatched color/type; allow override with reason (audited).

## 6. Sync Contract (Offline-First)
**Principles**
- Server time is authoritative. Clients track `lastSyncedAt` per farm.
- Use **delta** by `updatedAt` and **tombstones** for deletes.
- **LWW** conflicts: server compares timestamps; returns 409 with latest snapshot if client stale.

**Endpoints**
- `GET /farms/{farmId}/sync/pull?since=ISO` → `{ animals:[], cycles:[], ... , tombstones:[{entity,id,deletedAt}], serverTime }`
- `POST /farms/{farmId}/sync/push` → `{ changes:[{entity,op,data,clientMutationId}], device:{id,version} }` → returns `{ mappings, conflicts, serverTime }`

**Batching**
- Default page size 500 rows; cursor/resume token per entity stream.

## 7. Business Modules & Rules
### 7.1 Breeding & Pregnancy
- **INS1**; **optional INS2 at ~+17d**; **check ≥28d** after INS1; some farms do second check **~45–50d**.
- **Gestation 150d**; if conception from INS2, **167d from INS1**. Due window & overdue logic.
- Reminders: CK1, CK2 (if plan two checks), lambing prep 7d before dueStart.
- Lambing record; loss handling; estimation of conception day when ambiguous.

### 7.2 Health & Treatments
- Diagnoses, treatments (drugs, doses), vaccines; **withdrawal** tracking (milk/meat).
- **Supplements** post-lambing: Oxy, Ceftanel, vitamins; batch actions; schedule & adherence.
- Alerts for dose due/overdue and upcoming expiries.

### 7.3 Feeding & Weight
- Weight records (single/batch); feed plans (roughage, concentrates, supplements).
- Lamb 0–35d feeding: **Nursing** vs **Manufactured milk**.
- KPIs: **ADG**, **FCR**; under/over-weight alerts.

### 7.4 Sales & Pedigrees
- Milk yields + **milk sales** (liters × price).  
- Animal sales: live/slaughter/cull; price & buyer.
- Pedigree links: sire/dam/offspring; inbreeding warnings.

### 7.5 Lamb Selection (Future Ewes)
- Scoring (0–100): Growth (0–40), Dam (0–30), Sire (0–20), Health (0–10); Recommended ≥70; Neutral 50–69.
- Override allowed with reason; audit trail; bloodline KPIs aggregated rolling 12–24 months.

### 7.6 Reports & Dashboards
- Farm dashboard: herd size, pregnant ewes, due windows, sick, milk sold, animal sales, profit estimate.
- **Cross-farm dashboard** (owner): per-farm cards + totals.
- Export CSV/XLSX from web.

### 7.7 Inventory & Costs (best-effort)
- Resolver order: **Batch/FIFO → Last Known Price → Catalog default → Derived(unit) → Fuzzy name match → Reference → Zero**.
- Persist `costValue`, `costSource`, `confidence`; nightly backfill upgrades confidence.

### 7.8 Insights & Causality
- ActionEvent (shearing, supplier/ration/protocol change, move).  
- Methods: **Pre/Post uplift**, **Difference-in-Differences**, **Change-point**, **Lagged correlation** (1–21d).  
- Output: InsightCard(effect %, window, lag, confidence High/Medium/Low) with narrative and “Confirm/Mute”.

## 8. Notifications & Reminders
- Triggers: lambing, pregnancy result, dose due/overdue, milk discarded, sales posted, low stock/expiry.
- Channels: FCM push + in-app inbox.
- Quartz: `reminders:dispatch` every 10m; respects member subscriptions (by event type).

## 9. Exports/Imports
- **Exports**: Animals, Events, Sales (animals/milk), KPIs, Costs(+confidence). Localized headers; ISO dates.
- **Imports**: CSV/XLSX templates; preview with row-level status; **idempotency** by `(farmId, externalRowId)`.

## 10. Performance & SLOs
- API P50 < 300ms; background jobs @ nightly windows.
- Mobile list 2k animals @ 60fps; background sync ≤ 2 min/session.
- Sync batch default 500 rows; configurable limit & backoff.

## 11. Deployment & Environments
- DO App Platform container; Managed Postgres & Redis; DO Spaces for media.
- Envs: `SPRING_PROFILES_ACTIVE`, DB, REDIS, S3, FCM, OTP, JWT, rate limits. Secrets in DO env; Bitbucket secured vars.
- App versions: semantic; feature flags optional.

## 12. Observability & Operations
- Micrometer → Prometheus; Grafana dashboards: sync latency, job durations, notification success, DB slow queries.
- JSON logs to stdout; Sentry errors. Backups: DO managed + weekly dump to Spaces; restore tests monthly.

## 13. Compliance & Privacy
- Local SMS provider; sender ID per regulation. DLR webhook optional; no PII in logs.  
- Opt-in **anonymous benchmarking** (disabled by default).

## 14. Roadmap (Post-MVP)
- Task manager & work orders; advanced ledger & accounting; sensor/rfid scale integrations; AI hints; WhatsApp OTP; DOKS migration.
