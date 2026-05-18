# /api — Backend interface boundary

This directory is the **only** layer that should change when ROOTCHAIN swaps
its mock backend for a real one (Supabase, Firebase, custom REST, etc.).

Phase 2 keeps everything in-memory inside `client.ts`. Phase 3 will:

1. Replace `mockGet` / `mockMutate` with `fetch()` against the routes in
   `routes.ts`.
2. Layer auth headers (Stellar SEP-10 challenge) inside the client.
3. Add cache invalidation tied to Zustand stores.

Services in `/services` are written against this boundary, so the swap is
mechanical: no UI components or stores will need to change.
