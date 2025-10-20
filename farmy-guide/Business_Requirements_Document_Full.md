# Business Requirements Document (Full) — FarmApp
**Version:** 1.0  
**Date:** 2025-09-11

## Table of Contents
1. Context & Goals
2. Personas & Roles
3. Scope Overview
4. Module Requirements
   - 4.1 Breeding & Pregnancy
   - 4.2 Health & Treatments
   - 4.3 Feeding & Weight
   - 4.4 Milking & Sales
   - 4.5 Sales & Pedigrees
   - 4.6 Lamb Selection (Replacement Ewes)
   - 4.7 Reports & Dashboards
   - 4.8 Inventory & Costs
   - 4.9 Insights & Causality
   - 4.10 Notifications & Reminders
   - 4.11 Data Export/Import
5. Cross‑Cutting Requirements
6. Data & Reporting
7. Integrations
8. Non‑Functional Requirements
9. Acceptance Criteria
10. Out‑of‑Scope
11. Appendices (Field dictionaries, CSV templates, Reminders timeline)

---

## 1. Context & Goals
- **Market:** Palestinian small/medium sheep farms; limited land; feed is purchased; family‑operated.  
- **Problem:** Paper or WhatsApp notes → missed breed checks, poor visibility on health, no costing insight.  
- **Goal:** Deliver a **mobile‑first, offline‑first app** with reminders, dashboards, exports, and insights.  
- **Languages:** Arabic & English (RTL for Arabic).  
- **Super‑Admin Ops:** your operations team can create farms and users, assign roles, and provide support.  

## 2. Personas & Roles
- **Owner/Admin:** Manages farm, approves sales, sees dashboards and reports.  
- **Family/Worker:** Records day‑to‑day (lambing, health, feed, milk, sales).  
- **Vet:** Records diagnoses/treatments; monitors withdrawal.  
- **Super‑Admin Ops:** Creates farms/users, manages roles, support (impersonate view‑only).  

## 3. Scope Overview
Modules included in MVP:  
1. Breeding & Pregnancy  
2. Health & Treatments  
3. Feeding & Weight  
4. Milking & Sales  
5. Sales & Pedigrees  
6. Lamb Selection (replacement ewes)  
7. Reports & Dashboards  
8. Inventory & Costs (best‑effort)  
9. Insights & Causality  
10. Notifications & Reminders  
11. Data Export/Import  

---

## 4. Module Requirements

### 4.1 Breeding & Pregnancy
**Workflows:**  
- Record **INS1**; optionally **INS2 ~+17d**.  
- Pregnancy check **≥28d** (Check1); optional second check ~45–50d.  
- Gestation: **150d** (or 167d from INS1 if conception from INS2).  
- Lambing due windows & overdue detection.  
- Record lambing: litter size, sexes, stillbirths, notes.  
- Record losses/abortions.  

**Business Rules:**  
- If no lambing by 153d after INS1 → assume conception at INS2.  
- Reminders: INS2, Check1, Check2, lambing prep, overdue.  

**Data Fields:**  
- eweId, ins1Date, ins2Date?, check1Date/result, check2Date/result, lambingDate, litterSize, male, female, stillborn, notes.  

**Edge Cases:**  
- Conflicting check results → latest positive wins unless loss recorded.  
- Abortion resets cycle.  

**User Stories:**  
- *As a farmer, I want reminders for checks so I don’t miss them.*  
- *As a vet, I want to record loss events so herd stats remain accurate.*  

**Acceptance Criteria:**  
- System auto‑calculates due window.  
- Overdue animals appear in dashboard.  

---

### 4.2 Health & Treatments
**Workflows:**  
- Record diagnosis → treatment plan (drug, dose, frequency, duration).  
- Log doses given; record vaccines.  
- Supplements: Oxy, Ceftanel, vitamins (esp. post‑lambing).  

**Business Rules:**  
- Withdrawal tracked; milk flagged “discard” until safe.  
- Reminders: dose due/overdue.  

**Data Fields:**  
- animalId, diagnosisCode, treatmentName, drug, dose, route, duration, withdrawalEnd, lot/expiry, givenBy.  

**Edge Cases:**  
- Herd treatments → batch apply with per‑animal exceptions.  
- Change of drug mid‑course.  

**User Stories:**  
- *As a vet, I want withdrawal enforced so unsafe milk isn’t sold.*  
- *As a farmer, I want overdue alerts for doses so I don’t miss them.*  

**Acceptance Criteria:**  
- Withdrawal dates calculated automatically.  
- System blocks milk sale when withdrawal active.  

---

### 4.3 Feeding & Weight
**Workflows:**  
- Record weights (batch).  
- Define feed plans (ration composition).  
- Track lamb milk feeding (0–35d: nursing vs manufactured).  

**KPIs:** ADG, FCR, under/over‑weight alerts.  

**Data Fields:**  
- weight: animalId, date, kg.  
- feedPlan: name, components, ratios.  
- lambFeeding: lambId, method, start/end, volume.  

**Edge Cases:**  
- Manual vs device weights (allow notes).  

**User Stories:**  
- *As a farmer, I want to track lamb growth to select future ewes.*  
- *As an owner, I want to monitor FCR to optimize feed costs.*  

**Acceptance Criteria:**  
- ADG calculated correctly.  
- Alerts fire if lamb below threshold weight.  

---

### 4.4 Milking & Sales
**Workflows:**  
- Record milk yields (per ewe/session/daily).  
- Record milk sales (liters × price).  
- Record animal sales (live/slaughter/cull).  

**Business Rules:**  
- Milk in withdrawal → cannot be sold.  
- Buyers optional but tracked.  

**Data Fields:**  
- milkYield: animalId, at, liters.  
- milkSale: date, liters, pricePerLiter, buyer?.  
- animalSale: animalId, date, type, weight?, price, buyer?.  

**Edge Cases:**  
- Shared milk from multiple ewes → allow “bulk entry.”  

**User Stories:**  
- *As an owner, I want to see milk revenue by period.*  
- *As a farmer, I want the system to prevent sale of withdrawal milk.*  

**Acceptance Criteria:**  
- Revenue reports aggregate correctly.  

---

### 4.5 Sales & Pedigrees
**Requirements:**  
- Maintain sire/dam links.  
- Warn on inbreeding risk.  
- Show pedigree tree on web/mobile profiles.  

**User Stories:**  
- *As a breeder, I want to avoid inbreeding so I get healthier lambs.*  

**Acceptance Criteria:**  
- Warning triggers if mating close relatives.  

---

### 4.6 Lamb Selection (Replacement Ewes)
**Scoring Model:**  
- Growth 0–40, Dam 0–30, Sire 0–20, Health 0–10.  
- Recommend ≥70, Neutral 50–69, Not Recommended <50.  

**Business Rules:**  
- Overrides require reason (audited).  

**User Stories:**  
- *As an owner, I want to identify the best lambs as future ewes.*  

**Acceptance Criteria:**  
- Scores displayed; override reasons logged.  

---

### 4.7 Reports & Dashboards
- Farm dashboard: herd size, pregnancies, due, sick, milk sold, sales, profit estimate.  
- Cross‑farm dashboard: owner view of multiple farms.  
- Exports CSV/XLSX.  

**User Stories:**  
- *As an owner, I want to see KPIs across all my farms.*  

**Acceptance Criteria:**  
- Dashboard shows per‑farm and totals.  

---

### 4.8 Inventory & Costs
- Always enabled, best‑effort.  
- Resolver order: Batch/FIFO → Last Known Price → Catalog default → Derived → Fuzzy → Reference → Zero.  
- Confidence badges (High/Med/Low).  
- Nightly backfill improves estimates.  

**Acceptance Criteria:**  
- Costs displayed with confidence tag.  

---

### 4.9 Insights & Causality
**Events:** shearing, supplier change, ration change, protocol shift.  
**Methods:** pre/post uplift, DiD, change‑point, lag correlation.  
**Outputs:** InsightCard (effect %, lag, window, confidence High/Med/Low).  

**User Stories:**  
- *As an owner, I want to know if supplier change affected growth.*  

**Acceptance Criteria:**  
- Insights generated nightly; at least pre/post uplift available.  

---

### 4.10 Notifications & Reminders
- Push + in‑app.  
- Triggers: lambing, preg result, doses due, milk discarded, sales posted, low stock.  
- Member subscriptions by event type.  

**Acceptance Criteria:**  
- Reminders dispatch every 10m.  

---

### 4.11 Data Export/Import
- Export: Animals, Events, Sales, KPIs, Costs.  
- Import: CSV templates; preview + idempotency by (farmId, externalRowId).  

---

## 5. Cross‑Cutting Requirements
- Offline‑first sync with LWW.  
- Multi‑farm support.  
- Arabic/English RTL.  
- Accessibility: large touch, numeric keypads.  
- Audit: EventLedger.  

## 6. Data & Reporting
KPIs: pregnancy rate, lambing %, mortality, ADG, milk sold, revenue, costs.  

## 7. Integrations
- Optional RFID (Bluetooth).  
- Local SMS provider.  
- DO Spaces for media.  

## 8. Non‑Functional
- API P50 < 300ms.  
- 2k animals lists at 60fps.  
- Availability: 99.5%.  
- Security: JWT, farm scoping, HTTPS only.  
- Backups weekly + restore tests.  

## 9. Acceptance Criteria (MVP)
- Mobile records events offline + syncs correctly.  
- Web dashboards/export accurate.  
- OTP works with local SMS.  
- Notifications for lambing/doses.  
- Insights generate pre/post uplift cards.  
- Inventory shows costs with confidence.  

## 10. Out‑of‑Scope
- Grazing, advanced accounting, hardware beyond RFID, gov APIs.  

## 11. Appendices

### 11.1 Field Dictionary
- Animal: tagNumber, rfid?, type, sex, status, dob?, farmId.  
- BreedingEvent: eweId, type, date, payload.  
- HealthEvent: animalId, type, date, drug, dose, duration, withdrawalEnd.  
- MilkYield: animalId, at, liters.  
- SaleMilk: date, liters, pricePerLiter, buyer?.  

### 11.2 CSV Templates
- Animals.csv: tagNumber,rfid,type,sex,dob,status,notes  
- BreedingEvents.csv: eweTag,eventType,date,notes  
- HealthEvents.csv: animalTag,type,drug,dose,freq,duration,startDate,withdrawalEnd,notes  
- Weights.csv: animalTag,date,kg  
- MilkYields.csv: animalTag,at,liters  
- MilkSales.csv: date,volumeLiters,pricePerLiter,buyerName  
- AnimalSales.csv: animalTag,date,type,weightKg,price,buyerName  

### 11.3 Reminder Timeline Example
- INS1 recorded → suggest INS2 +17d.  
- CK1 reminder at +28d.  
- CK2 optional at +45–50d.  
- Lambing prep 7d before dueStart.  
- Overdue alert if >dueEnd.  
