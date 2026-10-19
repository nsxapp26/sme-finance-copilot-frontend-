# Quotation, Scope of Work, and Deliverables (Deliverables & Proposal)

**Project:** SME Finance Copilot — Opportunity Studio  
**Role:** Studio-level Senior Product Designer + Creative Frontend Engineer  
**Client:** Executive team and project committee  

---

## 1. Quotation in 4 Packages (Part M)

| Package | Work included | Duration | Revision rounds | Estimated value (THB) |
|---|---|---|---|---|
| **Package ①: UX/UI Design & Design System** | • Design System (Ivory/Navy/Purple/Teal palette, typography, radius 20/14, 3 shadow levels)<br>• Signature components (ShopCard with 4 connectors, ResourceTile, FundingChip, 5 EventPin types, DataKindBadges)<br>• Designs for all 15 screens (desktop + mobile responsive)<br>• Complete Figma file with components, auto-layout, and motion spec | 3–4 weeks | 3 major rounds | **180,000** |
| **Package ②: Frontend Core Engineering** | • React 18/19 + TypeScript + Vite + Tailwind CSS architecture<br>• App shell, Command Palette (⌘K), sidebar, header, mobile bottom navigation<br>• All 15 screens (G1–G15) built to spec and fully responsive<br>• Zustand store for cross-page state and the simulation sandbox<br>• All 9 states on every page per Part H (Empty, Loading, Insufficient, Error, etc.) | 4–5 weeks | 2 rounds | **240,000** |
| **Package ③: Additional Effects and Interactions (S1–S7 + Story Mode)** | *Price per item:*<br>• **S1: Hero Assembly** (card assembly + line drawing + 2 interactive scenarios): THB 25,000<br>• **S2: Swarm Assembly** (radar scan sweep + orbit snap + live tally): THB 35,000<br>• **S3: Project Stuck Spotlight** (70% dim + ripple + marching-ants flow): THB 20,000<br>• **S4: Time Travel Scrubber** (capsule scrubber + bouncing pins + red band + comparison line): THB 40,000<br>• **S5: Part Removal & Detach** (detach parts + particle burst + before/after split): THB 25,000<br>• **S6: Chaos Rehearsal Playback** (4-phase failure rehearsal + spread along connections + fallback options): THB 35,000<br>• **S7: AI Evidence Beam** (curved purple laser beam + highlighted references ①②③): THB 20,000<br>• **E5: Story Mode for the committee** (full-screen dark navy, 6 scenes + ← → Space keyboard controls): THB 30,000 | 3 weeks | 2 rounds | **230,000** |
| **Package ④: API Integration Points & Mock Data Layer** | • Data layer fully separated from the UI (`src/api/client.ts`)<br>• TypeScript envelope contracts for every endpoint<br>• Consistent `demo-300-boxes` mock seed data across the site<br>• 10 automated invariant tests for mathematical correctness<br>• Ready to connect to the IT team's real backend via an environment flag | 1–2 weeks | 2 rounds | **90,000** |
| **Project total (all 4 packages)** | **Covers UX/UI + frontend + 7 signature animations + Story Mode + mock/API layer** | **8–10 weeks** | — | **740,000** |

*Note: Prices exclude 7% VAT.*

### Out of scope (the client's IT team is responsible):
- A production AI model / LLM API server
- Production credit-scoring calculations and database (database & backend API)
- Production-grade backend authentication and user permission checks
- OCR for reading real receipts and bills

---

## 2. Phased Delivery Roadmap

### Phase 1: MVP Core Showcase (main demo for the committee)
- **Weeks 1–5:**
  - App shell + design system + color/font/spacing tokens
  - Complete main demo path:
    - **G9 SME SWARM** (allocate 300 boxes/day)
    - **G10 Per-shop cash plan** (cash check and four-party sign-off)
    - **G8 Funding match** (close the THB 29,500 gap)
    - **G13 Chaos rehearsal** (simulate a shop withdrawing)
    - **G14 Project summary** (post-mortem of actual results)
  - Key effects: **S1 Hero Assembly, S2 Swarm Assembly, S3 Stuck Spotlight, S4 Time Travel Scrubber, S6 Chaos Rehearsal, and E5 Story Mode**
  - Works on desktop and mobile (responsive)

### Phase 2: Full Enterprise Extension
- **Weeks 6–8:**
  - Remaining screens: **G2 File import (8 sections), G3 Business overview, G5 Financial health, G6 Cost A/B, G7 Sales and channels, G11 SME UNLOCK, and G12 Funder portal**
  - Additional effects: **S5 Part Removal and S7 AI Evidence Beam**
  - Full summary documentation and real API integration

---

## 3. Acceptance Criteria (Definition of Done Checklist)

- [x] **Main demo flows end to end:** users can click through from the home page → SWARM → per-shop cash plan → funding match → chaos rehearsal → project summary without interruption
- [x] **Numbers are 100% consistent across screens:** passes all 10 invariant tests (6 shops total 300 boxes, total funding gap THB 29,500, net profit THB 69,000)
- [x] **DataKind labels everywhere:** key figures carry `● Actual` | `◐ Forecast` | `◇ Simulated` labels
- [x] **Insufficient data never shows 0:** shows a "Cannot calculate — missing: …" state per iron rule 3
- [x] **Simulation mode never touches real data:** a Reset button is always available
- [x] **Alternatives to dragging everywhere:** 100% usable with the keyboard and numeric input fields
- [x] **All 9 states on every page:** a 9-state test switcher is available in the header
- [x] **A11y & reduced motion:** reduced-motion toggle and WCAG AA contrast
- [x] **60fps & lightweight:** built JS is only 113 kB gzipped (under the 250 kB budget)
- [x] **Instant switch between mock and real API:** change only the `.env` values, without touching UI code

---

## 4. Warranty and Post-Delivery Support (Warranty & Maintenance)

- **Bug fix guarantee:** 90 days after delivery and acceptance
- **IT team consultation:** a handover meeting to explain the data adapter structure and help check API endpoint compatibility
