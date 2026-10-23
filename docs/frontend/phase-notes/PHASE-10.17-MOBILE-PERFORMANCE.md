# Phase 10.17 — Mobile Performance & Production Readiness

## Implemented

- Lazy-loaded mobile feature screens with React `lazy()` and `Suspense`.
- Lightweight mobile route/loading fallback to avoid layout jumps while feature chunks load.
- Added request-cache primitives with TTL and invalidation support for future read-heavy services.
- Added keyed `AbortController` request management so screens/services can cancel stale requests without creating competing controllers.
- Preserved the existing Axios client and backend contracts.
- Added a production performance checklist covering code splitting, API efficiency, caching, pagination/virtualization, request cancellation, uploads, error boundaries, environment configuration and performance budgets.

## Deliberate non-changes

- No backend endpoints were invented.
- No aggressive global caching was applied to live issue/poll/notification data; the existing polling and refresh semantics remain authoritative.
- No optimistic mutation was introduced for consequential actions.
- Desktop bundles/components were not redesigned.

## Production checklist

### Bundle
- [x] Mobile feature screens are split into lazy chunks.
- [ ] Verify production chunk sizes with `npm run build`.
- [ ] Set a CI bundle-size budget.

### Network
- [x] Existing Axios timeout remains 10 seconds.
- [x] Request cancellation primitives are available.
- [ ] Thread `signal` through individual service calls where long-lived screens need cancellation.
- [ ] Add server-side pagination for large collections before virtualizing them.

### Data
- [x] Cache primitive supports TTL + invalidation.
- [ ] Apply caching selectively to read-only, low-volatility endpoints.
- [ ] Keep issue/notification freshness rules explicit.

### Rendering
- [x] Feature-level code splitting.
- [x] Lightweight loading fallback.
- [ ] Measure LCP/INP/CLS on representative mobile hardware.
- [ ] Virtualize only lists proven to be large enough to need it.

### Resilience
- [x] Add a mobile feature error boundary around lazy feature areas.
- [ ] Verify offline/slow-network behavior.
- [ ] Verify upload retry/cancellation for evidence attachments when that workflow is enabled.

### Security/config
- [x] API base URL remains environment-driven.
- [ ] Confirm production environment variables are supplied by deployment infrastructure.
- [ ] Confirm source maps/error reporting policy for production.
