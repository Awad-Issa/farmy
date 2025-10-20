# FarmApp – Cursor Source of Truth (Docs Pack)
**Date:** 2025-09-11

Use these documents as the **single source of truth** for Cursor to scaffold and implement the project.

## Files
- `System_Technical_Spec.md` — Master system spec (architecture, data, sync, security, modules, deployment)
- `Frontend_Implementation_Guide.md` — Web app implementation details
- `Mobile_Implementation_Guide.md` — Mobile app implementation details (offline-first)
- `Backend_Implementation_Guide.md` — Spring Boot backend implementation details
- `openapi.yaml` — API contract (authoritative)
- `API_Guide.md` — How to use the API (auth, headers, sync, pagination, errors)

**Tip for Cursor**: Reference sections explicitly, e.g. “Implement `/farms/{id}/sync/pull` per *System_Technical_Spec §6* and *openapi.yaml*.”
