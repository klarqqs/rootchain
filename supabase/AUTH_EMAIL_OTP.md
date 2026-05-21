# Supabase Auth — Email OTP (signup + login)

Run this checklist in the **Supabase Dashboard** for the project that backs `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

## 1. Email provider

1. **Authentication** → **Providers** → **Email**.
2. Enable **Email** sign-in.
3. Turn on **Email OTP** (six-digit code). If your dashboard only shows “Confirm email”, upgrade the project or use the Auth settings that expose OTP; the app calls `signInWithOtp` + `verifyOtp` with `type: 'email'`.
4. Prefer **Secure email change** and rate limits appropriate for production.

## 2. URL configuration

1. **Authentication** → **URL configuration**.
2. **Site URL**: your production SPA origin (e.g. `https://app.example.com`).
3. **Redirect URLs**: add every origin you use, including:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - Production HTTPS origin(s)

OAuth (Google) still uses these for return navigation.

## 3. SMTP (strongly recommended)

Default Supabase email is **rate-limited** and often lands in spam.

1. **Project Settings** → **Auth** → **SMTP**.
2. Configure a provider (Resend, AWS SES, Postmark, etc.).
3. Send a test mail and confirm the six-digit template renders.

## 4. Database trigger

Run [`001_app_profiles.sql`](./migrations/001_app_profiles.sql) once. The `handle_auth_user_profiles` trigger reads `raw_user_meta_data.role` and `full_name` when a row is inserted into `auth.users`.

Email OTP creates the user when the code is verified; `options.data` on `signInWithOtp` must include at least `role` and `full_name` for signup (the app sends the same shape as the old `signUp` metadata).

## 5. Staging smoke test

1. Sign up from the app → receive code → verify → confirm `app_profiles` row exists.
2. Sign out → **Sign in with email code** → verify session restores.
3. Sign in with **password** (after signup, a password is set via `updateUser`).
