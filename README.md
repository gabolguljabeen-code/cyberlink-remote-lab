# CyberLink Remote Lab

Educational, owner-approved Android administration lab. The web dashboard and API deploy together on Vercel; Turso is the application database and LiveKit Cloud is used only for real-time media. The Android APK is a separate build and is not deployed by Vercel.

## Current implementation status

- Responsive React/Vite dashboard shell and device pairing invitation dialog.
- Vercel function endpoints for account registration/login/logout, invitation creation/enrollment, device listing/revocation, and short-lived LiveKit viewer tokens.
- Drizzle schema and initial SQL migration for users, devices, invitations, remote sessions, permissions, audit events, file transfer metadata, and authentication sessions.
- Kotlin Android project shell with explicit MediaProjection consent, visible foreground service, and stop control.
- Not yet complete: browser sign-in/account screens and API-backed dashboard state; Android pairing client/API URL configuration, device metadata submission, LiveKit publishing/room connection and service resource cleanup; user-approved file/location/app-management modules; production rate limiting and automated security tests. These are not represented as working product features.

The Android source demonstrates the consent and foreground-service boundary; it does **not** yet send a screen stream. Do not distribute it as a functioning streaming client until the LiveKit publisher and cleanup lifecycle are implemented and reviewed.

## Local setup

1. Use Node.js 20+ and npm. Run `npm install`.
2. Create a Turso database, copy `.env.example` to `.env.local`, and provide `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. The API never sends these values to browser code.
3. Apply the schema with `npx drizzle-kit migrate` after generating/validating migrations, or run `drizzle/0000_initial.sql` against the database using the Turso CLI. Keep migrations under version control.
4. `npm run dev` starts the Vite frontend. Vercel API functions require Vercel dev (`npx vercel dev`) or deployment; Vite alone does not serve `api/`.
5. Configure LiveKit Cloud credentials only in Vercel server environment variables. Viewer tokens are room-scoped, subscriber-only and expire after five minutes.

## Vercel deployment

Import the repository with root directory set to the project root. Build command: `npm run build`; output directory: `dist`. Add the Turso and LiveKit environment variables in Vercel Project Settings. Use a deployment with `/api/*` function support. Configure HTTPS and an appropriate restrictive origin/CORS policy before production.

## Android build

Open `apps/android` in Android Studio with JDK 17 and Android SDK 35, sync Gradle, then build the `app` debug APK for development. For distribution, configure a private signing key outside the repository, build a signed release APK, verify its signature, and publish only the reviewed artifact under `public/downloads/`. Never commit signing keys. Vercel serves a signed APK as a static download; it does not build or deploy Android.

## Security and privacy checklist

- Enforce HTTPS, rotate all secrets, restrict Vercel environment access, and configure per-account/IP rate limiting at an edge service before public registration/login.
- Add account recovery, email verification, session management UI, login throttling, security headers, strict origin checks, and operational alerting before production.
- Review CSRF behavior and cookie domain/path settings on the production hostname. State-changing authenticated API calls require the `X-CSRF-Token` header.
- Pairing secrets are random, stored as SHA-256 hashes, expire and are single-use. Enrollment should be rate-limited and the owner should be shown the exact device identity before approving it.
- Only collect the allowlisted device metadata. Never add IMEI, credentials, messages, contacts, call history, covert sensors, screen recording, or private-file extraction.
- Screen sharing must require fresh Android system consent, a persistent visible notification, owner stop control, and immediate LiveKit disconnect on revoke. No automatic restart.
- Use documented Android APIs only. Accessibility actions need a separate explanation, manual activation in Android settings, visible status and tightly constrained action allowlists. Enterprise-only capabilities must state the enrollment requirement.
- Audit pairing, session creation/revocation, permission changes and access-token issuance without recording personal content. Define retention and deletion policies.
