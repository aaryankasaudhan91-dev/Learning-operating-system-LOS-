# Synapse — implementation and setup

Updated 21 October 2026. Student research project by Aaryan Kasaudhan and Nikhil Pandey.

## What changed

- `frontends/website`: ID creation, Windows download, an automatic top promo, inline About scrollytelling, researcher links, and an environment-configured bottom YouTube walkthrough.
- `frontends/desktop`: the Electron learning frontend.
- `frontends/mobile`: the Capacitor learning frontend and Android native project.
- `packages/learning-ui`: shared TypeScript learning screens, original logo, role-specific UI, light/dark themes, custom startup and loading states.
- `backend`: Firebase authentication, encrypted session storage, authorization, MongoDB persistence, Socket.IO notifications, live-provider-only AI, support and activity records.

The website never loads the desktop learning routes. The About story and promotional media are website-only. Startup and route animations respect reduced motion. The top promo has no play/pause controls and stops on a readable final frame; the Studio preview retains controls for editing.

## Authentication and data flow

The frontends call Synapse APIs. They no longer import the Firebase SDK or contain Firebase configuration. Backend login uses Firebase Authentication's password endpoint, verifies the resulting token and creates a Firebase session. The frontend receives an opaque Synapse bearer token held in tab-scoped session storage. MongoDB stores its hash and an AES-256-GCM encrypted Firebase session, with a seven-day expiry. Logout removes that session. Closing the browser tab/app clears its local token; signed-in sessions are not designed to persist across app restarts in this version.

Private API calls and Socket.IO connections verify identity. Learners request teacher links; only the named teacher can accept. Teachers can edit their own courses and access their accepted learners. Task answers, homework, graded quizzes, personal quests, focus activity and support tickets persist in MongoDB. Quiz answer keys are withheld until submission. Focus totals and streaks are calculated from recorded activity, with UTC day boundaries.

Real provider calls replace canned AI replies. Missing provider configuration, quota exhaustion and service outages return explicit failures. Tests never call a paid AI provider or use production accounts.

## Backend configuration — private

Edit `backend/.env` on the server. Keep it outside public folders and version control.

| Setting | Purpose |
|---|---|
| `MONGODB_URI` | Your production MongoDB connection |
| `FIREBASE_PROJECT_ID` | Your Firebase project |
| `FIREBASE_WEB_API_KEY` | Server-side Firebase password/reset API calls |
| `GOOGLE_APPLICATION_CREDENTIALS` | Private Firebase Admin credential file outside the frontend, or configure workload identity |
| `AUTH_SESSION_ENCRYPTION_KEY` | Stable private 32-byte base64 key; generated locally without displaying its value |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server secret |
| `TURNSTILE_HOSTNAME` | Exact hostname allowed for the signup widget |
| `PUBLIC_SITE_URL` | Your final HTTPS website origin |
| `TRUST_PROXY` | `loopback` for a local reverse proxy; configure the actual trusted network before deployment |
| `APP_ORIGINS`, `REALTIME_ORIGINS` | Exact permitted website/native origins |
| `ANALYTICS_ENABLED` | First-party aggregate counters; enabled locally, only sent by the website after opt-in |
| `AI_PROVIDER`, `AI_MODEL` | Explicit optional provider/model selection |
| Provider API key | Server-only key for the selected provider |
| `AI_DAILY_REQUEST_LIMIT` | Daily per-user attempt allowance; default 20 |

Enable Email/Password in your Firebase project. Firebase Admin credentials are not currently configured on this machine; neither a credential environment path nor local Google application credentials was found. Live sign-in/session issuance has therefore not been verified. Do not paste private credentials into chat.

Signup is deliberately unavailable until real Turnstile configuration is supplied. The server checks token validity, the hostname and `signup` action before creating the Firebase user and MongoDB profile. It rolls back Firebase account creation if profile creation fails. A honeypot and rate limits provide additional protection. Existing users sign in through the backend; development token fixtures exist only in tests.

## Website configuration — public

Edit `frontends/website/.env.local`, then restart/rebuild the website.

```dotenv
VITE_BACKEND_URL=
VITE_SITE_URL=
VITE_INFO_YOUTUBE_URL=
VITE_OPERATOR_NAME=
VITE_SUPPORT_EMAIL=
VITE_TURNSTILE_SITE_KEY=
VITE_ANALYTICS_ENABLED=true
```

- Leave `VITE_BACKEND_URL` empty for same-origin production hosting or the local development proxy; otherwise use your HTTPS API origin.
- Put the YouTube watch/share URL only in `VITE_INFO_YOUTUBE_URL`. Only validated HTTPS YouTube links are accepted. The video loads after the visitor chooses to load it. The configured URL becomes visible to the browser when used; an environment file does not make a public video private.
- The public Turnstile site key belongs here. Its secret belongs only in the backend.
- Set the final HTTPS `VITE_SITE_URL` to generate canonical/social URLs and sitemap entries. Until it is set, the site is intentionally `noindex` and robots disallows indexing.
- Add the operator name and contact email when ready. Research credits already use the names and links you supplied. Legal pages describe current behavior but require operator/regional review before launch; no legal-compliance certification is claimed.

For desktop/mobile, use `packages/learning-ui/.env` with `VITE_BACKEND_URL` and `VITE_SITE_URL` only. The installed apps need a reachable HTTPS backend and the website origin for registration.

## Website essentials

Privacy and terms are separate routes. About remains inline on the home page. Cookie settings can be reopened from the footer; analytics stays off before consent or after Essential only. Aggregate analytics stores day/page/event/count and expires after 90 days; it does not include account details or full URLs. Production HTTPS redirects, HSTS and browser security headers are implemented. A TLS certificate and a correctly configured reverse proxy are still required at deployment. Bind/restrict the Node port so clients cannot bypass that proxy.

The website includes title/description, original favicon, a 1200×630 compressed social card (~29 KB), image alternative text, sitemap/robots generation, responsive layouts, visible focus outlines, form validation and a custom 404 with HTTP 404 status. Built JS/CSS have gzip copies and the backend serves them with correct content types. No public contact/domain or YouTube URL has been invented.

## Commands

Run from the project root:

```text
npm run dev:backend
npm run web:dev
npm run dev:frontend
npm run typecheck
npm run test:backend
npm run web:build
npm run build -w backend
npm run mobile:sync
npm run desktop:installer
node desktop/publish-download.mjs
```

For isolated Mongo tests, `mongodb-memory-server` uses a local disposable database. Set `MONGOMS_SYSTEM_BINARY` to an installed official `mongod` binary when needed. No production database was used for these tests.

Production: build the website/backend, set `NODE_ENV=production` and required environment values, then run `npm run start -w backend` behind TLS. The backend serves `frontends/website/dist` by default when started from the backend workspace. Run one API instance with the current in-memory rate limiter and Socket.IO adapter. Multiple instances require shared rate limiting and a Socket.IO adapter before scaling out.

## Verification and limits

Five test groups pass: persisted API/ownership boundaries, explicit database outages, authenticated private Socket.IO updates, HTTPS/proxy behavior, and legal/static/gzip/404 delivery. TypeScript and frontend/backend builds pass. Mobile web assets sync into Android. Mobile-width layout and light/dark text contrast were checked; detailed local results are in `Website-Verification.json`. These are local checks, not a public Lighthouse/Core Web Vitals score.

The Windows installer is unsigned, so SmartScreen can still appear. A signing certificate is required for a signed release. Android SDK tools were not available, so no APK has been produced. iOS packaging requires macOS/Xcode. No live AI provider, real Firebase account, real email reset, external production deployment or production data migration was exercised.

Before exposing existing data, review old users/courses: legacy course ownership must be mapped to verified authors, teacher relationships must be accepted, and any historical demo/seed records must be identified. Existing records were not silently deleted or reassigned. Old local personal quests are not automatically imported into the new account store. New requests never seed dummy courses.

The 30-second film is built and checked as a deterministic composition. Review it in Studio at `http://localhost:3017/#project/synapse-promo`. MP4 export awaits your review under the video workflow's required render gate.

## Implementation references

- Firebase session management: https://firebase.google.com/docs/auth/admin/manage-cookies
- Firebase Authentication REST endpoints: https://firebase.google.com/docs/reference/rest/auth
- Turnstile server validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Express trusted proxies: https://expressjs.com/en/guide/behind-proxies.html
- Privacy-notice guidance used as a drafting reference, not a compliance determination: https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/how-to-write-a-privacy-notice-and-what-goes-in-it/
