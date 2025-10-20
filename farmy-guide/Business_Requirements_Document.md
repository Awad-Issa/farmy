# Business Requirements Document (BRD) — FarmApp
**Version:** 1.0  
**Date:** 2025-09-11

## Table of Contents
1. Context & Goals
2. Personas & Roles
3. Scope (Modules)
4. Detailed Requirements by Module
5. Cross‑Cutting Requirements
6. Data & Reporting
7. Notifications & Reminders
8. Integrations
9. Non‑Functional Requirements
10. Acceptance Criteria
11. Out‑of‑Scope
12. Appendices (Field dictionaries & CSV templates)

---

## 1. Context & Goals
- **Market:** Palestinian small/medium sheep farms; limited land; feed is **purchased**; family operations.
- **Problem:** Paper/WhatsApp notes → missed breed checks, poor visibility on health & costs, no offline app.
- **Goal:** A mobile-first, offline-first app to track breeding, health, feed/weights, milk, sales, and costs; give **clear reminders** and **actionable insights**.
- **Languages:** Arabic & English (RTL for Arabic).
- **Users:** Farmers (owner/workers), vets, and your **Super-Admin Ops** for provisioning/support.

## 2. Personas & Roles
- **Owner/Admin**: manages farm, members, approves sales, views dashboards & exports.
- **Family/Worker**: records day-to-day events (lambing, treatments, milking, weights, sales).
- **Vet**: records diagnoses & treatments; monitors withdrawal.
- **Super-Admin Ops**: creates farms/users, assigns roles, support/impersonate (view-only).

## 3. Scope (Modules)
1) **Breeding & Pregnancy**  
2) **Health & Treatments** (vaccines, withdrawal, supplements)  
3) **Feeding & Weight** (lamb milk 0–35d)  
4) **Milking & Sales** (milk yields + milk sales)  
5) **Sales & Pedigrees** (animal sales; pedigree & inbreeding warnings)  
6) **Lamb Selection** (replacement ewes)  
7) **Reports & Dashboards** (farm & cross-farm)  
8) **Inventory & Costs** (best-effort costing)  
9) **Insights & Causality**  
10) **Notifications & Reminders**  
11) **Data Export/Import** (CSV/XLSX)

## 4. Detailed Requirements by Module

### 4.1 Breeding & Pregnancy
**Workflows:**
- Record **INS1**; optionally **INS2** at ~+17 days.  
- **Check 1** ≥ 28 days after INS1; optional **Check 2** ~45–50 days.  
- Gestation **150 days** (or **167d from INS1** if conception from INS2).  
- Generate lambing **due window** and **overdue** logic.  
- Record **lambing** (litter size, sex breakdown, outcomes) or **loss**.

**Business Rules:**
- If no lambing by **153 days** from INS1 → assume conception at INS2 (adjust due).  
- **Reminders:** INS2 suggestion (+17d), CK1 (+28d), CK2 (+47–50d), lambing prep (7d before dueStart), overdue alert.  
- Partial data allowed (unknown dates ok); app estimates and labels as such.

**Data Fields (examples):**
- EweId, INS1Date, INS2Date?, Check1Date/Result, Check2Date/Result, PregConfirmedDate?, DueStart, DueEnd, EstDue, LambingDate, LitterSize, Male, Female, Stillborn, Notes.

**Edge Cases:**
- Multiple checks with conflicting results → keep ledger; latest positive wins unless loss recorded.  
- Abortion after confirmation → update cycle to **LOST** and generate health follow‑up task.

### 4.2 Health & Treatments
**Workflows:**
- Record **diagnosis**, start **treatment** plan (drug, dose, frequency, duration); log **doses**.  
- Record **vaccines**; manage **withdrawal** (milk/meat) windows.  
- Record **supplements** (Oxy, Ceftanel) esp. post‑lambing.

**Business Rules:**
- Enforce withdrawal: milk/animal flagged “do not sell” until window ends.  
- Doses due generate reminders; overdue escalate.

**Fields (examples):**
- AnimalId, DiagnosisCode, TreatmentName, Drug, Strength, Dose, Route, Freq, Duration, StartDate, WithdrawalEndDate, Lot/Expiry, GivenBy, Notes.

**Edge Cases:**
- Change of drug mid‑course updates remaining schedule.  
- Herd treatments (batch apply) with per‑animal exceptions.

### 4.3 Feeding & Weight
**Workflows:**
- Add **weights** (single/batch).  
- Define **feed plans** (ration compositions).  
- Track **lamb milk feeding 0–35 days**: **Nursing** vs **Manufactured**.

**KPIs & Rules:**
- Compute **ADG** (average daily gain) and **FCR** where possible.  
- Alerts: under/over-weight thresholds by age/sex.

**Fields (examples):**
- Weight: AnimalId, Date, Kg.  
- FeedPlan: Name, Components, Ratios, Notes.  
- LambFeeding: LambId, Method (Nursing/Manufactured), Start/End, Volume/day if Manufactured.

### 4.4 Milking & Sales
**Workflows:**
- Record **milk yields** per ewe, session or daily total.  
- Record **milk sales** (volume × price).  
- Record **animal sales** (type: live/slaughter/cull), price, weight (optional).

**Rules:**
- If in **withdrawal**, milk is **discarded** not sold.  
- Price per liter may vary by buyer; track buyer name optional.

**Fields:**
- MilkYield: AnimalId, At (timestamp), Liters.  
- MilkSale: Date, Volume, PricePerLiter, Buyer.  
- AnimalSale: AnimalId, Date, Type, WeightKg?, Price, Buyer?

### 4.5 Sales & Pedigrees
- Maintain **sire/dam** links; show **inbreeding warning** if mating close relatives.  
- Simple **pedigree tree** view in web & mobile profile.

### 4.6 Lamb Selection (Replacement Ewes)
**Scoring model (default, editable):**
- Growth (0–40), Dam (0–30), Sire (0–20), Health (0–10).  
- Recommend ≥70; Neutral 50–69; Not Recommended <50 (override allowed with reason).

### 4.7 Reports & Dashboards
- Farm dashboard: herd size, pregnancies, due windows, sick, milk sold, animal sales, **profit estimate**.  
- **Cross‑farm dashboard** (owner): cards per farm; filters by date.  
- Exports (CSV/XLSX) for Animals, Events, Sales, KPIs, Costs (+confidence).

### 4.8 Inventory & Costs (Best‑Effort)
- Always-on **cost resolver**: Batch/FIFO → Last Known Price → Catalog default → Derived → Fuzzy match → Reference → Zero.  
- Show **confidence badge**; nightly backfill improves estimates.

### 4.9 Insights & Causality
- **Action events**: shearing, supplier change, ration change, protocol shift, pen moves.  
- Methods: **pre/post uplift**, **difference-in-differences**, **change-point**, **lagged correlation** (1–21d).  
- Output: Insight card with **effect %**, **lag**, **window**, **confidence**; allow **Confirm/Mute**.

### 4.10 Notifications & Reminders
- Push + in‑app for: lambing recorded, pregnancy result, doses due/overdue, milk discarded, sales posted, low stock/expiry.  
- **Per-member subscriptions** by event type.

### 4.11 Export/Import
- Export CSV/XLSX; Import templates with preview and idempotency (`farmId, externalRowId`).

## 5. Cross‑Cutting Requirements
- **Offline-first** (mobile): Outbox, delta sync, LWW conflict.  
- **Multi-farm**: switch farm; data strictly scoped by `farmId`.  
- **Localization**: Arabic/English with RTL.  
- **Accessibility**: large touch targets; numeric keypads.  
- **Auditability**: EventLedger with who/when/what.

## 6. Data & Reporting
- KPIs: herd size, pregnancy rate, lambing rate, mortality, ADG, milk sold, revenue, cost coverage (best-effort).  
- Date filters: today, 7d, 30d, custom range.  
- Cross-farm owner view: per-farm breakdown.

## 7. Notifications & Reminders (details)
- Generation on domain events; dispatch every 10 minutes.  
- In-app inbox mirrors pushes for offline viewing.  
- Subscription management per member in settings.

## 8. Integrations
- **RFID** optional (Bluetooth Serial/HID).  
- **Local SMS** provider for OTP.  
- **DO Spaces** for media (photos, docs).

## 9. Non‑Functional Requirements
- Performance: API P50 < 300ms; 2k animals lists @ 60fps mobile.  
- Availability: 99.5% MVP target.  
- Security: JWT, farm scoping, data encryption at rest (managed), HTTPS only.  
- Backups: automated + weekly logical dump; monthly restore test.

## 10. Acceptance Criteria (MVP)
- Mobile records **lambing/treatment/weights/milk/sales** offline and syncs correctly with conflict handling.  
- Web shows **accurate dashboards & exports**; Ops can create farms/users.  
- OTP works with local SMS; rate limited; Arabic template.  
- Notifications fire for lambing and due/overdue doses.  
- Insights produce at least pre/post uplift cards.  
- Inventory costs display with confidence and improve after backfill.

## 11. Out‑of‑Scope (MVP)
- Grazing/pasture planning, advanced accounting, hardware beyond optional RFID, government APIs.

## 12. Appendices

### 12.1 Field Dictionary (selected)
- Animal: tagNumber (numeric, unique per farm), rfid?, type (RAM/EWE/LAMB), sex, status, dob?, farmId, updatedAt.  
- BreedingEvent: eweId, type, date, payload{notes, operatorId}.  
- HealthEvent: animalId, type, date, payload{drug, dose, freq, duration, lot, expiry, withdrawalEnd}.  
- MilkYield: animalId, at, liters.  
- SaleMilk: date, volumeLiters, pricePerLiter, buyerName?.

### 12.2 CSV Templates (headers)
- **Animals.csv**: `tagNumber,rfid,type,sex,dob,status,notes`  
- **BreedingEvents.csv**: `eweTag,eventType,date,notes`  
- **HealthEvents.csv**: `animalTag,type,drug,dose,freq,duration,startDate,withdrawalEnd,lot,expiry,notes`  
- **Weights.csv**: `animalTag,date,kg`  
- **MilkYields.csv**: `animalTag,at,liters`  
- **MilkSales.csv**: `date,volumeLiters,pricePerLiter,buyerName`  
- **AnimalSales.csv**: `animalTag,date,type,weightKg,price,buyerName`

