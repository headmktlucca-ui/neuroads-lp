# PLAN: Hub Real Metrics Integration

We will implement real data tracking for the redesigned Hub page, fetching indicators from connected accounts (Google Ads, Meta Ads, LinkedIn Ads, GA4) and displaying "N/A" with debug recommendations for disconnected ones. We will exclude the Marketing Channel Network constellation map from the layout.

## 1. Analysis

### Tech Stack
- Next.js 16 App Router
- React (Client Hooks)
- Tailwind CSS / Vanilla CSS
- Lucide React (Icons)
- Google Analytics 4 Data API
- Google Ads / Meta Ads / LinkedIn Ads Extraction API

### Target Components & Routes
- `src/app/api/hub/metrics/ga4/route.ts` (retrieve GA4 `purchaseRevenue`)
- `src/components/hub/HubDashboard.tsx` (fetch and aggregate real data, layout widgets from Anexo 01 excluding constellation map)
- `src/app/hub/page.tsx` (manage state or loading indicators)

---

## 2. Dynamic Component Design (Anexo 01 Grid Layout)
- **Top Row KPI Cards**: Total Spend, Total Revenue, ROAS, Conversions, CPA, AOV.
- **Left Column**: Channel Performance (ROAS & sparkline status).
- **Middle Column**:
  - Top: Neuro-Ad Performance Trend.
  - Middle: Real-time Performance & Budget Allocation side-by-side or stacked.
  - Bottom: Audience Insights.
- **Right Column**: Live Data Feed.
- **Collapsible Bottom Panel**: Observations and instructions on connecting missing integrations.

---

## 3. Tasks

### Task 1: Update GA4 Metrics Route
- **File**: `src/app/api/hub/metrics/ga4/route.ts`
- **Action**: Add `purchaseRevenue` to metrics payload. Extract its value from Google Analytics API response.

### Task 2: Implement Real Data Aggregation in HubDashboard
- **File**: `src/components/hub/HubDashboard.tsx`
- **Action**:
  - Read `profile?.connections` using `useAuth()`.
  - Fetch real metrics if connections are active.
  - Compute total Spend, Revenue, ROAS, CPA, and AOV.
  - Fall back to "N/A" if any metric dependencies are missing.
  - Render widgets with styling from Anexo 01.

### Task 3: Build & Verification Check
- **Action**: Run lint and Next.js compiler check.

---

## 4. Verification

- `npx tsc --noEmit`
- `npm run build`
