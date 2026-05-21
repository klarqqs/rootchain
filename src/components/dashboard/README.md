# Dashboard UI

Operator and investor **in-app** surfaces (post-auth / portfolio shell) continue to live alongside features:

- `src/pages/dashboard.tsx`, `src/pages/wallet.tsx`, …
- `src/features/dashboard/`, `src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`

The **DashboardLayout** wrapper (`src/layouts/DashboardLayout.tsx`) composes the existing sidebar + TopBar + scroll region. No components were moved here to avoid churn; this folder is reserved for future dashboard-only primitives.
