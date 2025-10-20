# Backend Implementation Guide (Spring Boot 3, DigitalOcean)

**Version:** 1.0

## Table of Contents
1. Tech Stack & Dependencies
2. Security & OTP
3. Farm Scoping & Roles
4. Data & Migrations
5. Sync Endpoints
6. Domain Modules
7. Jobs & Scheduling
8. Notifications & Inbox
9. Exports/Imports
10. Observability & Backups
11. CI/CD & Deployment

---

## 1. Tech Stack & Dependencies
- Java 21, Spring Boot 3.3+
- Spring Web, Spring Data JPA, Spring Security 6, Validation
- PostgreSQL 15+ + Flyway
- Redis (Lettuce) – OTP, rate limit, queues (optionally Redis Streams)
- Quartz (JDBC store) – clustered-safe jobs
- springdoc-openapi (Swagger UI)
- Micrometer + Prometheus; Sentry
- AWS SDK v2 (DO Spaces S3)

## 2. Security & OTP
- **Local SMS OTP**: 6-digit codes; Redis record `{hash, attempts, expiresAt, resendAfter}`; TTL 5m; max 5 fails; resend after 45–60s (max 2).
- **Rate limiting**: Redis token bucket per phone/IP.
- **JWT**: access 30m; refresh 30d. Generic responses to avoid enumeration.
- **Arabic SMS template**; optional DLR webhook `/sms/dlr` to track delivery.

## 3. Farm Scoping & Roles
- Entities include `farmId`. `X-Farm-Id` filter validates membership (Owner/Admin/Worker/Vet).
- **Super-Admin Ops** role with full tenant view; support impersonation **view-only**; all audited (userId, farmId, action, time, ip).

## 4. Data & Migrations
- Flyway `V1__init.sql` baseline; Quartz tables in Flyway as well.
- Indexes on `(farmId, updatedAt)`, `(farmId, tagNumber)`, and date columns in event tables.
- Tombstones table for deletes.

## 5. Sync Endpoints
- `GET /farms/{farmId}/sync/pull?since=ISO` – changed entities + tombstones + serverTime.
- `POST /farms/{farmId}/sync/push` – outbox changes with `clientMutationId`; returns mappings & conflicts. LWW conflict policy.

## 6. Domain Modules
- **Breeding**: INS1/INS2, checks, gestation calc, lambing record, loss.
- **Health**: treatments, vaccines, **withdrawal** tracker; supplements (Oxy, Ceftanel).
- **Feeding & Weight**: weights, feed plans, lamb milk (0–35d).
- **Milking & Sales**: milk yields & sales; animal sales (live/slaughter/cull).
- **Pedigrees**: sire/dam links; inbreeding warning.
- **Inventory/Costs**: best‑effort resolver; confidence & backfill.
- **Insights**: ETL metric snapshots; pre/post, DiD, change-point, lag scan → InsightCard.
- **Reports**: CSV/XLSX exports.

## 7. Jobs & Scheduling
- Quartz cron:
  - `reminders:dispatch` every 10 min
  - `etl:metric_snapshots` nightly 00:05 UTC
  - `insights:impact_scan` nightly 00:45 UTC
  - `costing:backfill` nightly
- Retry policies & idempotent job keys (farm + domain + window).

## 8. Notifications & Inbox
- Domain events → queue → FCM push + insert into `NotificationInbox`.
- Per-member subscriptions by event type; respect user’s device tokens.

## 9. Exports/Imports
- Exports: CSV/XLSX; localized headers; ISO dates.
- Imports: templates; preview with errors/warnings; idempotency `(farmId, externalRowId)`.

## 10. Observability & Backups
- Metrics: sync latency, job durations, notification success, DB slow queries.
- Logs: JSON to stdout; Sentry for error tracking.
- Backups: DO managed + weekly logical dump to Spaces; monthly restore drills.

## 11. CI/CD & Deployment
- Bitbucket Pipelines: build/test → push image to DOCR → Flyway migrate → App Platform deploy.
- Envs: `SPRING_PROFILES_ACTIVE`, DB/REDIS/S3/FCM/SMS/JWT settings; rate-limits.
