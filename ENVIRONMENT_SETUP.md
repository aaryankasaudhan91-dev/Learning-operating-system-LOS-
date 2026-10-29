# Synapse environment setup

Run from the project root:

    npm run setup:env
    npm run check:ready

Setup creates missing environment files, adds missing settings, and generates an empty session-encryption key privately. It preserves existing values. The check prints setting names and status, never their values. It checks local configuration; real services need a connection test after configuration.

| File to edit | Settings |
| --- | --- |
| backend/.env | MongoDB URI; Firebase project/API key/private credential path; session-encryption key; Turnstile secret/hostname; optional AI provider/model/key; HTTPS origin; trusted proxy; REST/Socket.IO origins; analytics switch |
| frontends/website/.env.local | Public website/API origins; public Turnstile site key; operator/contact; optional YouTube/download URL; analytics switch |
| packages/learning-ui/.env | Public HTTPS API and signup website origins for desktop/mobile releases |

All supported fields are described in the adjacent .env.example. Environment files are ignored by Git. Every VITE_ value becomes public browser code.

## Core account setup

1. Set MONGODB_URI to real persistent local or hosted MongoDB. Temporary databases and automatic demo records are test-only.
2. In Firebase Console, enable Email/Password under Authentication. Enter FIREBASE_PROJECT_ID and FIREBASE_WEB_API_KEY in the backend.
3. Save the Firebase Admin service-account JSON outside public folders. Set GOOGLE_APPLICATION_CREDENTIALS to its private absolute path. Managed hosting can use workload identity/application-default credentials instead. Keep the JSON/private key out of frontend files and chat.
4. Keep AUTH_SESSION_ENCRYPTION_KEY stable. Changing it invalidates encrypted sessions.
5. Create a Turnstile widget for your hostname. Add its secret/exact hostname in the backend and its public site key in the website. The widget action is signup.
6. Re-run the check, restart backend/website, then test real signup, login, logout and password reset using accounts you control.

The backend creates Firebase accounts, verifies Firebase identity and stores encrypted sessions. Clients receive opaque Synapse tokens. Missing configuration produces an unavailable state, never a fake user.

## Optional services

- Live AI: choose one supported AI_PROVIDER, an available AI_MODEL and that provider's backend-only key. Leave other provider keys blank. There is no automatic paid fallback.
- YouTube: put the informational link only in VITE_INFO_YOUTUBE_URL. Visitors choose when to load it. The top promo remains local.
- Analytics: enable both switches if wanted. Optional consent is required before the website sends aggregate events.
- Downloads: leave VITE_WINDOWS_DOWNLOAD_URL blank for the local installer manifest, or set your external HTTPS installer URL.

## Public deployment

Use matching HTTPS origins for backend PUBLIC_SITE_URL and website VITE_SITE_URL. Set installed-app API/signup origins before release builds. Configure exact REST/Socket.IO origins, TLS and the trusted proxy. The backend binds to loopback by default; set HOST explicitly for a container/network deployment. Keep indexing disabled until the domain is ready.

Add the final operator/contact and review legal text for the deployment. Student research credits are already present.

## Fast local testing

- Start-Synapse.cmd runs the backend and three browser previews.
- Test-Desktop.cmd opens Electron development mode with automatic frontend updates.
- Website: http://127.0.0.1:5174/
- Shared app: http://127.0.0.1:5173/
- Mobile preview: http://127.0.0.1:5175/

Keep the launcher window open; press Ctrl+C to stop. Account actions need the real backend settings above.

Build with npm run web:build, npm run build -w backend, npm run mobile:sync, and npm run desktop:installer. Android APKs need an Android SDK; iOS needs macOS/Xcode. Signed Windows releases need a signing identity.
