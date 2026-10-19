# API Contract Matrix — Backend / AI ↔ Frontend

Latest verified backend source: `efd42db` on `main` (verified 2026-10-18; handoff
docs refreshed in `4da3614`). The complete backend suite passed against the
disposable PostgreSQL test database: **555 passed, 1 skipped**. The single skip
is the test that explicitly verifies behavior with the database disabled;
database-backed feature tests ran. The test database uses synthetic seed data
and is removed after the run. Historical block test counts and branch references
below describe their original runs, not this latest verification. Current
frontend instructions are in
[`frontend-integration.md`](frontend-integration.md).

Provider hardening: stable SHA-256-derived advisory transaction lock, held on one
session through fetch, cache/backoff persistence and commit. Concurrency tests
use independent DB sessions and separate Python hash seeds. Provider tests now
use synthetic gate keys/transports; they no longer clear or fake-success the
real GDELT gate. Existing assertions retained; publication-date test additionally
requires a nonempty synthetic article list. One permitted real request on
2026-10-17 at 07:02 Asia/Bangkok timed out: unavailable / 0 articles / backoff 60s,
read back from provider_fetch_state. Historical lastSuccessAt from old tests is
not evidence of live news success. No force refresh, retries or paid LLM calls.

Stored required dependencies are authoritative even when POST swarm receives
inline shops with resources=[]; clients cannot erase a required offered truck.
Saving a mixed known/unknown shop set does not persist only a subset.

The Cost page now renders nullable financial values safely. For all views,
continue to treat an unknown value as `null` and preserve the response's
`missing` fields rather than displaying an invented zero.

Final prototype validation (`f23c09e`): StatementRequest rejects coverage earlier
than input.period_end with 422; unsupported 90-day forecast calendar returns 422
instead of 500. `/capabilities` reports deterministicAnalysis mode=rules and
savedSimulationReplay.available follows DATABASE_URL configuration. This flag is
a configured capability, not a database liveness probe. Current quick start:
[backend README](../backend/README.md); consolidated route and calculation
reference: [API and math](../backend/docs/API_AND_MATH.md).

## Backend integration block 1 — implemented 2026-10-17

Branch `codex/demo-backend`, based on `5422af8`. This section supersedes legacy
notes below for the listed endpoints. Frontend is owned by Claude on
`codex/demo-frontend`; no `src/**` changes are included in this backend block.

**Breaking correction:** all five Cost scalars (`costPerUnit`, `profitPerUnit`,
`breakevenUnits`, `currentMonthlyFixedCost`, `currentMonthlyVariableCost`) are
`number | null`. Known zero remains 0. Unknown is null + missing, never a zero
placeholder. Consumers must render null without invoking `.toFixed()` on it.

| Implemented endpoint | Request location | Result / identity / errors |
| --- | --- | --- |
| POST `/api/v1/analyze` | JSON `{input, shop_name?, use_llm?, sme_id?, project_id?, input_revision?, expected_input_hash?, schedule_complete_through?}` | Existing analysis + views; context on every view; forecast view added. Stateless, no write. Expense observations bounded by input.period_end. |
| POST `/api/v1/funding/evaluate` | JSON `{input, amount?, sector?, sme_id?, project_id?, input_revision?, expected_input_hash?}` | `data:{requestedAmount:string|null, notRequired:boolean|null, grade, gradeScore, funding:[], investors:[], options:[]}`; supplied statement determines grade/DSCR, never stored seed statement. persist=false always. |
| POST `/api/v1/forecast/preview` | JSON `{input, sme_id?, project_id?, input_revision?, expected_input_hash?, schedule_complete_through?}` | Forecast continued from input cash_balance/period_end using dated rows of exactly this SME/project. No projection write. Without SME: data=null, missing=[cash_forecast], insufficient_data. |
| GET `/api/v1/capabilities` | no body/query | Explicit unavailable business transactions and available preview endpoints. |

These routes also exist under `/api`. Existing `POST /match-funding` remains a
legacy **query-parameter** API against stored statements. Imported workflows must
use `/funding/evaluate`, not GET funding/options or legacy match-funding.
No application, signing, information-request, PDF/export or reservation operation
is implemented. Keep those actions unavailable according to `/capabilities`.

`input` is the normalized FinancialInput contract (39 fields). Synthetic full
example: `backend/examples/analysis_input.json`; minimum valid request:

```json
{"input":{"currency":"THB","kind":"simulated","period_start":"2026-09-01","period_end":"2026-09-30","assets":"100000","liabilities":"60000","equity":"40000"},"input_revision":"synthetic-r1"}
```

Send the same normalized input and revision to analysis, funding and forecast.
`amount` is a decimal string. If omitted funding uses **this input's computed
funding_gap** only; unknown gap returns requestedAmount=null + requested_amount
missing, no candidates. Explicit zero returns notRequired=true, no candidates.
Sector is supplied explicitly; omission leaves investor sector evidence missing.
DB catalogue required for funding (503 without DATABASE_URL).

Every contextual response includes:

```json
{"source":"supplied_input","inputHash":"<sha256 normalized input>","contextHash":"<sha256 context plus consumed evidence>","context":{"smeId":null,"projectId":null,"inputRevision":"synthetic-r1","inputHash":"<same hash>","periodStart":"2026-09-01","periodEnd":"2026-09-30","scheduleCompleteThrough":null}}
```

`input_revision` is an opaque client revision, not authentication. Return values
must be discarded if their revision/hash differs from the active draft.
`expected_input_hash` is optional optimistic validation: mismatched or malformed
hash => 422; it is not a credential. Use the hash returned by analyze, since
normalization adds optional null fields. Do not compare contextHash across
different operations: each operation consumes a different evidence set.
UUID identities: malformed 422, unknown 404, named identity without DB 503.
An absent identity stays null, never inferred from a shop name or default SME.
Project scope filters dated events; it does not prove order membership or reserve
resources. Coverage remains an explicit caller assertion; unknown horizons null.

CORS now accepts `Authorization, Content-Type` for each configured origin only;
unlisted origins remain rejected. Auth enforcement settings are unchanged.

GET financial analysis views and POST analyze now both bound expense observations
through the selected statement period_end. Legacy GET defaults still select a
stored statement, so they must not replace accepted imported views.

## Backend integration block 2 — implemented and verified 2026-10-17

| Endpoint | Exact request | Result / errors |
| --- | --- | --- |
| POST `/calculate` | Existing JSON plus `project_id?`, `input_revision?`, `expected_input_hash?`, `schedule_complete_through?` | context/inputHash returned. Existing compute-only behavior for unknown SME is retained: persisted=false. |
| GET `/simulator/context` | query `project_id=<UUID>` and/or `order_ref=<string>`; omit both only for legacy active default | Existing `data:SwarmRequest` plus top-level projectId, constraints, contextHash. Named absent project 404; mismatched selectors 404. |
| GET `/projects/{project_id}/constraints` | UUID path | `data:null` for unknown snapshot, or exact explicit object. missing describes unknown fields. |
| POST `/projects/{project_id}/constraints` | JSON constraint snapshot (example below) | Replace snapshot, persisted=true; no allocation/reservation. Staff only when RBAC enforced; 403 other roles, 404 unknown project, 422 invalid input. |
| POST `/swarm` | Existing JSON plus optional `project_id`, `input_revision`, `input_hash` | project_id/order_ref mismatch 409; stored constraints apply when omitted by client. Preview persist=false never writes. Supplied resource state differing from DB rejected with 409 when persisting. |
| POST `/simulate/order` | `{baseline:SwarmRequest, scenario:OrderScenario, persist:false, context_missing:[], project_id?, sme_id?, input_revision?, input_hash?}` | Existing Plan A/B + engine=order-what-if/v2 and context. Linked input_hash is a reference to imported analysis, not a claim that order baseline equals a financial statement. |
| POST `/simulate` | Existing statement JSON plus StatementRequest context fields | Full request/results/plan analyses/version saved, rather than delta only. Both plans have rules findings based on their own recomputed statement; dated forecast/expense evidence remains missing. |
| GET `/simulations` | **query scope required:** project_id, sme_id or order_ref. Multiple selectors intersect. limit integer 1..100, default 30 | `data:[{simulationId,smeId,projectId,scenarioKey,createdAt,engine,context,replayAvailable}]` newest first. |
| GET `/simulations/{simulation_id}` | UUID path + **same query scope** | `data:{...summary,request,results,resultHash}`; wrong context 404, omitted scope 422. |
| POST `/simulations/{simulation_id}/replay` | UUID path + **query** scope; optional query input_revision/input_hash to compare active context. **No JSON body.** | data includes reproduced, savedResultHash, recomputedResultHash, savedEngine/currentEngine, contextDifferences, context, results, replaySource=saved_snapshot. persisted=false always. |

All paths above have `/api` and `/api/v1` prefixes. Saved storage disabled => 503.
Saved read/list/replay honor SME ownership when enforcement is on; unscoped project
plans require staff. Normal demo enforcement remains off. Project ID is a context
selector, not an authentication mechanism or approval of suitability.

Synthetic constraint snapshot (real requirements must come from the owner):

```json
{"required_business_types":["synthetic_food"],"max_distance_km":null,"collection_schedule":[{"day_index":7,"fraction":"1"}]}
```

SQL NULL / omitted key / required_business_types:null is unknown; explicit []
means no type restriction. Omitted max_distance_km is unknown; explicit null
means no distance limit. Non-null radius requires buyer_coordinates with decimal
latitude/longitude. Collection fractions must sum to one for the invoice balance.
`collection_schedule:null` remains unknown and uses the engine's explicitly
conditional settlement assumption, not an asserted real payment date.
No existing project or offered resource is backfilled/confirmed by migration.
Retained allocations keep their resource links; resources_known records an
explicit dependency-free list, distinct from unknown dependencies.

OrderScenario keeps four existing required/optional controls and adds optional
`remove_shops:string[]` and `unavailable_resource_ids:string[]`. Example:

```json
{"unit_price":"100","cost_per_unit":null,"deposit_ratio":"0","payment_terms_days":5,"remove_shops":[],"unavailable_resource_ids":["synthetic-machine"]}
```

Only IDs present in baseline may be removed/disabled (422 otherwise). Required
resource outage excludes affected shops; preference outage is reported without
inventing additional cost/delay. Unknown resources never become confirmed.
Removing every candidate returns 422 because the engine needs a nonempty
candidate set. Unsupported narrative Chaos, automatic contingency costs,
reservation and resource-capacity scheduling stay unavailable via /capabilities.

Replay uses the saved complete snapshot, not current DB values. Exact deterministic
result equality yields reproduced=true. Live order changes, engine version or
caller-supplied revision/hash differences yield status=stale and explicit
contextDifferences, even when the snapshot reproduces. Legacy partial saves are
readable with replayAvailable=false; replay returns 409. No migration invents
missing historical input/audit/version. Stored results include both order audits
or both statement metrics/grading/findings. Observation timestamps belong to the
response envelope and are excluded from deterministic statement-plan payloads.

Validation evidence: 535 passed / 3 skipped with PostgreSQL, 421 / 117 without DB
(this block's measured run). Real HTTP + DB read-back passed through
`backend/scripts/verify_backend_demo.py`: template import, persisted calculation,
shared input hash, B/75 matching, own dated forecast 70,000 minimum / 85,000 at 90
days, food-only allocation, resource outage, save/list/read/replay, 404/422 cases.
Fixtures are isolated synthetic UUIDs and cleaned after the run.

GET cashflow/timeline no longer combines all SMEs' events with one shop's opening
cash: legacy default selects one SME and returns smeId + missing default selection.
Use forecast/preview for imported closing cash/date and explicit coverage.
Malformed named SME identifiers no longer silently fall back to a demo answer.
Upload persist=false now suppresses rejection-event writes too; persist=true
continues to record rejected upload metadata as before.

Updated 2026-10-16 · checked against source `48d9385`, this round's validation regression repair, and live HTTP · base URL `/api/v1`.
This is the contract that exists today, not a design wishlist. The former `/import/upload`, `/import/validate`,
and `/import/confirm` entries never had real routes; use the upload/manual/analyze routes below.
See [feature status and handoff plan](../backend/docs/DEMO_HANDOFF.md) for work that is not yet implemented.

FinancialInput currently has 39 top-level fields (7 required / 32 optional); inventory is
optional and nullable, and Excel accepts the names Inventory/Stock and the Thai aliases สินค้าคงเหลือ/สต็อก. Import still accepts
38 fields; there is no inventory field or stock/DIO math yet. Unknown values never become 0, and NaN/Infinity
are rejected; adding inventory does not by itself provide evidence for calculating DIO.

## 1. Financial view envelopes and unknowns

Financial GET views return `data`, `kind`, `status`, `missing`, `asOf`, `source`;
most also include analyzedAt/evidenceRefs/unit depending on the endpoint. The binary template, auth, and
validation/operation responses have their own shapes; do not cast every response to a view.

```typescript
type FinancialView<T> = {
  data: T;
  kind: "actual" | "forecast" | "simulated";
  status: "ok" | "insufficient_data" | "stale" | "error";
  missing: string[];
  source: string;
  asOf: string;
  analyzedAt?: string;
  evidenceRefs?: { id: string; label: string; targetId: string }[];
};
```

`asOf` is a date/time when data exists; some offline/catalogue responses still return an empty string, which must not
be displayed as Invalid Date. Current source values include stored_record, database, supplied_input, demo_dataset, none.
A source read from the database does not turn seed data into real customer data.
An unknown scalar is null; a series without evidence is [] and is named in missing.
A response with a non-empty missing list must not claim ok; grading/metrics carry sub-statuses to check separately.

**Resolved (verified 2026-10-19 against `backend/app/adapters.py`):** the Cost adapter now returns
costPerUnit/profitPerUnit/breakevenUnits as null when data is missing, together with insufficient_data/missing,
instead of the earlier 0 placeholder.

**Resolved (verified 2026-10-19 against `src/api/contracts/types.ts`):** Envelope now includes `source`, and
BusinessOverview uses `number | null` for scalars and includes `netProfitMargin`, matching the backend.

## 2. Read contracts: the 16 routes the client actually calls

| View | Path after base URL | Actual payload / context |
| --- | --- | --- |
| Overview | `/overview` | BusinessOverview; scalars/diffs nullable, netProfitMargin; kind follows the input |
| Cashflow | `/cashflow/timeline` | CashflowDay[] from dated events; accepts sme_id; never spreads totals across days |
| Cashflow preview | `POST /cashflow/preview` | `{as_of, opening_cash, reserve, events[]}`; each event needs a date 1–90 days after as_of, a type, a description, an amount, and an in/out direction; returns simulated CashflowDay[] with `persisted=false`; never writes to the database |
| Shops | `/shops` | Shop[] with real UUIDs; no fixed number of shops |
| Order | `/order` | SwarmOrder or null; the active stored order per ACTIVE_PROJECT_ORDER |
| Stored proposal | `/swarm/proposal` | The saved SwarmProposal; not the latest POST preview |
| Shop finance | `/shops/{shop_id}/finance` | ShopFinance or null; real UUID, optional order_ref to pin the project |
| Funding options | `/funding/options` | FundingOption[]; sme_id/amount optional; by default finds an SME with a gap, not the imported input |
| UNLOCK catalogue | `/unlock/resources` | UnlockResource[]; a read, not a reservation/detach transaction |
| Chaos catalogue | `/simulator/chaos` | Stored ChaosScenario[]; reading a scenario does not run a simulation |
| Health | `/health/indicators` | HealthIndicator[]; value nullable; trend must be empty without evidence |
| Cost | `/cost/breakdown` | CostBreakdown; no NPV/IRR without a dated investment schedule |
| Products | `/sales/products` | ProductSales[] from the catalogue; no product breakdown is derived from an imported statement |
| Channels | `/sales/channels` | ChannelSales[] from the catalogue; no channel split is invented when rows are missing |
| Sales preview | `POST /sales/preview` | Accepts `{products[], channels[]}`; products need name/category/unitsSold/revenue/cost/turnoverDays; channels need channel/grossSales/commissionFee/adCost/deliveryCost; returns profit and margin from the entered rows, `kind=simulated`, `persisted=false`; never writes to the database |
| Funder | `/funder/projects` | FunderProject[]; the route uses resolve_principal; do not turn on enforcement before tokens are wired in |
| Projects | `/projects` | Saved ProjectRecord[]; does not generate report/export files |
| AI panel | `/ai/explain?page={id}` | Rules-based AIResponse; accepts sme_id/coverage; this GET never calls an LLM |

Overview/Health/AI accept sme_id and schedule_complete_through; Cost accepts sme_id.
The current client does not yet send this context from every getter. After a successful analyze, acceptedAnalysis replaces the GET for
Overview/Health/Cost/AI in that tab; other getters still read the database/defaults.
Do not assume that switching pages binds every page to the same imported input.

## 3. Input / engine / write endpoints that exist

| Method / path | Actual request | Result / limits |
| --- | --- | --- |
| GET `/analysis/template.xlsx` | No body | Binary XLSX Financials template |
| POST `/inputs/manual` | Flat FinancialInput | Validated data / balanceSheetValid; not an analysis |
| POST `/finance/calculate` | Flat FinancialInput | v1-only legacy calculate; not the wrapped CalculateRequest |
| POST `/upload?persist=false` | Multipart file, .xlsx ≤ 5 MiB | input, metrics, businessMetrics, grading, upload metadata; fileStored=false |
| POST `/calculate` | `{input: FinancialInput, sme_id?:string, persist?:boolean}` | metrics/businessMetrics/grading; persisted/recordId reflect the actual write |
| POST `/analyze` | `{input, shop_name?, use_llm?, sme_id?, schedule_complete_through?}` | data + Overview/Health/Cost/AI views, source/inputHash; stateless |
| POST `/swarm` | Order terms + inline shops or sme_ids; persist=false for a preview | Allocation totals/shops/stuckReasons + audit.eligibility; no fixed six-shop membership |
| GET `/simulator/context` | No body | SwarmRequest machine fields from the active project/shops/resources; 503 when DATABASE_URL is not set |
| POST `/simulate` | `{input, scenario, swarm?, sme_id?, persist?, scenario_key?}` | Statement Plan A/B, metrics/grading/delta; does not produce new analysis findings |
| POST `/simulate/order` | `{baseline, scenario:{unit_price,cost_per_unit,deposit_ratio,payment_terms_days}, persist:false, context_missing:[]}` | Order Plan A/B, audit, scope=order_only; persist=true stores the full replay input/results + simulationId |
| POST `/match-funding` | Query sme_id, amount?, project_id?, persist?; no JSON body | Ranks debt/equity for a stored SME; not a loan application |
| GET `/forecast` | Query sme_id, as_of?, project_obligations?, schedule_complete_through? | Dated forecast/conditional values; the default project_obligations=true may upsert cash events |
| GET `/industry/trends` | Query sector?, force_refresh? | Provider/cache status + articles/signals; a successful live feed is not yet confirmed; do not force a refresh during normal acceptance |

`/calculate/excel` and `/analyze/excel` take a multipart file; the v1-only `/inputs/excel` and
`/finance/calculate/excel` still exist. Main router paths have both `/api` and `/api/v1` aliases.
Auth provides POST `/auth/login`, `/auth/logout`, `/auth/revoke-all`, `/auth/revoke` and
GET `/auth/me`; tokens/revocation are not the role switcher in AppHeader.

## 4. Validation, precision, and scope

- The 7 required FinancialInput fields: currency, kind, period_start, period_end, assets,
  liabilities, equity. Omit empty optional fields; never convert them to 0. assets=liabilities+equity within tolerance.
- Money/rates use decimal strings; units_sold, number of installments, and credit days are JSON integers.
  deposit_ratio is 0..1, not a 0..100 percentage. cost_per_unit=null in an order scenario
  keeps each shop's own cost; an override applies the same assumption to every candidate and re-allocates.
- Invalid input returns HTTP 422; an oversized workbook returns HTTP 413. HTTP 200 + insufficient_data is a partial
  result: use the parts that have evidence and state what is missing; never leave the whole page on a skeleton.
- Order profit is before other expenses; minimumShopCash is the lowest cash of a participating shop,
  not a sum of surpluses across shops or a 90-day whole-business forecast.
- SWARM persist=false does not reserve quota/resources; persist=true changes the stored allocations.
  Calculate/upload persistence requires a real SME; a free-text name is not an identity.
- A preview/default/sample is not a plan the user has signed. When the input/context changes, never let a
  stale response or a generic default SME overwrite the latest result.

## 5. Buttons that have no backend operation yet

Funding application, agreement signing, funder document request, report/PDF export,
resource-detach recomputation, and Chaos apply still have UI/demo-side handlers only.
Saved simulations now have read/list/replay endpoints: GET `/simulations`, GET `/simulations/{simulation_id}`, and POST `/simulations/{simulation_id}/replay` (database required).
Never wire these to guessed paths or report success from a timer/local state.
CODEX should build the backend contract + tests/read-back, or wire an honest unavailable state,
before handing presentation work to the frontend team; see the backlog/acceptance criteria in the handoff.

AI evidence uses evidenceIds/dataUsed.targetElementId from the same SME/input result as the numbers.
Animation/Story/Phase is presentation only, not evidence that the engine or a write was called.

## Excel preview addition — 2026-10-17

`POST /api/v1/upload/preview` (also `/api/upload/preview`): multipart `file`,
read-only, no SME/project identity required. `format=financials` returns validated
`input`; `format=statements` returns separate scoped records and no combined
FinancialInput/grade. `persisted=false` always. Invalid/unsupported files: 422;
over 5 MiB: 413. Browser limit: 4 MiB on Vercel. Selection is transferred to the
manual review form, then submitted to the existing manual validation/analyze
contracts. See [workbook and input rules](../backend/docs/API_AND_MATH.md#financial-input-and-workbook-formats).
