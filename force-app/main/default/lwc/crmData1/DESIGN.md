# crmData1 — Generic Object Cards Component

Status: **design only — not yet implemented.** This doc is the plan; implementation starts after this is reviewed.

## 1. Goal

A single LWC that renders a list of records as cards (Account cards, Opportunity cards, etc.) where:
- The component has **no knowledge of Account or Opportunity** — it only renders generic `{ label, value, type }` pairs handed to it.
- All object-specific logic (which fields, labels, formatting, queries) lives in Apex.
- The same component is reused for every object by passing a different `objectApiName` (and optionally a title/icon).

## 2. Answers to the two open questions (context for the design below)

**Q1 — Calling Apex from LWC, and async support**

- LWC can only call `@AuraEnabled` Apex methods via `@salesforce/apex` imports (wire adapter or imperative). It **cannot** call the `@RestResource` classes already in this repo (`AccountApi`, `OpportunityApi` under `classes/RestAccountModule` / `RestOpportunityModule`) — those are HTTP REST endpoints for external callers, not part of the Aura/LWC Apex bridge. We need new `@AuraEnabled` methods; they can reuse the same SOQL as those REST classes, but should live in their own service class, not call into the `global` REST classes.
- Every LWC→Apex call is non-blocking already — `@wire` and imperative Apex calls return/resolve through a Promise, so the UI thread is never blocked regardless of query cost.
- "Async" in the sense of fire-and-forget (`@future`, `Queueable`, Batch) is a different thing: those don't hand a return value back to the caller, so they're wrong for "fetch and display records." We don't need them for this feature. `@AuraEnabled(cacheable=true)` is the right tool — it's a read, and `cacheable=true` gets LDS client-side caching + works with `@wire` for automatic refresh.

**Q2 — Single reusable component, backend sends fields+values**

- Confirmed. See architecture below: one generic Apex wrapper shape, one generic LWC, object-specific config is server-side-only data (a field allowlist map), never client-side object knowledge.

## 3. Architecture

```
LWC (crmData1)                     Apex (CardDataService)
───────────────                    ───────────────────────
@wire getCards({objectApiName})  → CardDataService.getCards(objectApiName)
                                      │
                                      ├─ validate objectApiName against
                                      │  allowlist (Account | Opportunity)
                                      ├─ look up configured field list
                                      │  for that object (server-side only)
                                      ├─ run SOQL (fixed, non-dynamic string
                                      │  built from the allowlisted fields)
                                      ├─ run Security.stripInaccessible
                                      │  (FLS enforcement)
                                      └─ map each SObject → CardRecord
                                         { recordId, title, fields: [CardField] }
                                         CardField { label, value, type }
  ◄─ List<CardRecord> (JSON) ──────────┘
render cards generically, no field knowledge
```

### Why server-side field allowlists instead of dynamic SOQL from the client
Letting the client specify field names and building SOQL from them is a SOQL-injection and FLS-bypass risk. Instead each object gets a small, explicit field list on the Apex side (a `Map<String, List<FieldConfig>>` or a custom metadata type, see §6 open question). The client only ever passes an **object API name** (an enum-like string), never field names.

## 4. Apex layer

**New class: `CardDataService.cls`** (`with sharing`, lives under a new `classes/CardData` folder or `classes/misc`, matching existing folder-per-module style like `RestAccountModule`).

```apex
public with sharing class CardDataService {
  @AuraEnabled(cacheable=true)
  public static List<CardRecord> getCards(String objectApiName) {
    // 1. validate objectApiName against a fixed Set<String> allowlist
    // 2. switch on objectApiName -> fixed SOQL per object (no string concatenation of field names)
    // 3. Security.stripInaccessible(AccessType.READABLE, records)
    // 4. map to List<CardRecord>
  }

  public class CardRecord {
    @AuraEnabled public String recordId;
    @AuraEnabled public String title;        // e.g. Account.Name / Opportunity.Name
    @AuraEnabled public List<CardField> fields;
  }

  public class CardField {
    @AuraEnabled public String label;        // display label, e.g. "Annual Revenue"
    @AuraEnabled public String value;        // pre-formatted string (currency/date already formatted server-side)
    @AuraEnabled public String type;         // 'text' | 'currency' | 'date' | 'number' — optional, for styling hints only
  }
}
```

Field lists per object (initial scope):

| Object | Title field | Card fields |
|---|---|---|
| Account | Name | Industry, Type, AnnualRevenue, NumberOfEmployees, BillingCity |
| Opportunity | Name | StageName, Amount, CloseDate, Account.Name |

These match the fields already queried in `AccountApi.getAccounts()` / `OpportunityApi.getOpportunities()`, so no new field decisions are needed — just re-expose a subset through the `@AuraEnabled` layer.

**Why not just call `AccountApi.getAccounts()` from the new service class directly?** Those methods are `global static` on `@RestResource` classes — callable in principle, but it couples the UI data path to a REST-contract class whose shape (full `Account` records) is meant for external API consumers. Re-querying with the exact fields we need keeps the two concerns (external REST API vs. internal UI data) independently changeable.

## 5. LWC layer

**`crmData1`** (already scaffolded, currently empty) becomes the generic card-list component.

Public API (`@api` properties):
- `objectApiName` (String, required) — `'Account'` or `'Opportunity'`
- `cardTitle` (String, optional) — header text, e.g. "Accounts"
- `iconName` (String, optional) — e.g. `'standard:account'` for `lightning-icon`

```js
import { LightningElement, api, wire } from 'lwc';
import getCards from '@salesforce/apex/CardDataService.getCards';

export default class CrmData1 extends LightningElement {
  @api objectApiName;
  @api cardTitle;

  @wire(getCards, { objectApiName: '$objectApiName' })
  cards;

  get records() { return this.cards?.data ?? []; }
  get hasError() { return !!this.cards?.error; }
  get isLoading() { return !this.cards; }
}
```

Template renders a `lightning-card`-wrapped grid; each record renders its `fields` array with a plain `template for:each` — no per-object markup branches.

**Consumer usage** (two instances on a page, zero component changes):
```html
<c-crm-data1 object-api-name="Account" card-title="Accounts"></c-crm-data1>
<c-crm-data1 object-api-name="Opportunity" card-title="Opportunities"></c-crm-data1>
```

## 6. Decisions (confirmed)

1. **Field config storage: hardcoded in Apex.** The per-object field map lives directly in `CardDataService` as a fixed `switch`/`Map`. Adding a new object or field requires a deploy — acceptable for current scope. Revisit as a Custom Metadata Type later only if admins need to configure this without a deploy.
2. **Card navigation: display-only, no click-through.** No `NavigationMixin` / record navigation in this version. Can be added later without changing the generic `CardField` shape.
3. **Pagination: `LIMIT 20`**, matching the existing `AccountApi`/`OpportunityApi` REST methods. Revisit if lists need to scale beyond that.
4. **Formatting: server-side, pre-formatted strings.** `CardField.value` is always a display-ready string (e.g. `AnnualRevenue` formatted as `"$1,200,000"`, `CloseDate` formatted as `"11/02/2026"`) built in Apex using `String.format(...)` / `DateTime` formatting helpers. The LWC renders `value` as plain text with no `lightning-formatted-*` components — it stays a pure "dumb" renderer with zero per-field logic.
   - **Known tradeoff, call out explicitly:** formatting in Apex means picking a fixed locale/format (e.g. hardcode `en_US`, or use `UserInfo.getLocale()` if we want it to follow the running user's locale — recommend the latter so it's not hardcoded to one locale even though formatting happens server-side). Currency symbol will reflect the field's currency code only if using `Decimal.format()` appropriately; this needs to be verified against a multi-currency org if this repo's org has multi-currency enabled.

## 7. Testing plan

- Apex: `CardDataServiceTest.cls` — one test per object type, plus a rejected/invalid `objectApiName` test, following the existing `*Test.cls` pattern (e.g. `AccountApiTest`, `OpportunityApiTest`).
- LWC Jest: extend the existing stub at `lwc/crmData1/__tests__/crmData1.test.js` — mock `getCards` wire adapter, assert card count renders for a given `objectApiName`, assert error state renders on wire error.
