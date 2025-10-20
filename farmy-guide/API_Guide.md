# API Guide (How to Use the OpenAPI Contract)

**Version:** 1.0

## Table of Contents
1. Authentication (OTP)
2. Headers & Farm Context
3. Sync Contract
4. Pagination, Filtering
5. Errors
6. Idempotency
7. Rate Limits

---

## 1. Authentication (OTP)
- `POST /auth/otp/request` → body `{ phone, purpose }` (purpose: login|invite).
- `POST /auth/otp/verify` → body `{ phone, code }` → returns `{ accessToken, refreshToken, newUser }`.
- Use `Authorization: Bearer <token>` for subsequent calls.

## 2. Headers & Farm Context
- Requests that operate on farm-scoped data **must** include: `X-Farm-Id: <farmId>`.
- The backend validates membership and role from JWT + FarmMember.

## 3. Sync Contract
- **Pull**: `GET /farms/{id}/sync/pull?since=ISO` → returns entity arrays + `tombstones` + `serverTime`.
- **Push**: `POST /farms/{id}/sync/push` with `changes:[{entity,op,data,clientMutationId}]`.
- Conflicts resolved by **LWW** (server `updatedAt` wins). Server may return `409` with latest snapshot.

## 4. Pagination, Filtering
- Use `?page` + `?size` where provided, or `?since` for delta-based lists.
- Search animals via `?q` (tag or RFID).

## 5. Errors
- JSON shape: `{ error: { code, message, details? } }`.
- Typical codes: 400 invalid input, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict (sync), 422 validation.

## 6. Idempotency
- For mutations (especially from mobile outbox), include a client-generated `clientMutationId`.
- Server should echo this ID back to map local/outbox records to server state.

## 7. Rate Limits
- OTP request limits per phone and IP; generic responses to avoid enumeration.
