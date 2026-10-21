# Synapse apps

The React TypeScript UI is shared by web, Capacitor mobile, and Electron desktop. Navigation, account menus, touch sizing, reading surfaces, theme tokens, and safe-area spacing share one design system. Existing course and learning components remain connected.

## Setup
Use Node 22 or newer. Run `npm install` in the repository root.
Set the existing Firebase VITE variables and `VITE_BACKEND_URL=https://your-backend.example` in `frontend/.env` before building. This is a public backend address, never an API secret. Installed applications need a reachable backend; localhost on a phone refers to that phone. Configure Firebase authorized domains and backend CORS for the installed clients. The backend remains a separately deployed service.

## Desktop
`npm run desktop` builds and launches the installed-style app locally.
`npm run desktop:package` creates an unpacked app; `npm run desktop:installer` creates the host platform installer in release/. Signing and store distribution need platform credentials.

## Mobile
Run `npm run build -w frontend`, the Android project is already generated under frontend/android/. Run `npm run mobile:sync` from the root. Run `npm run mobile:android -w frontend` to open Android Studio. Install Android Studio, its SDK and the JDK required by your Capacitor version before generating an APK.
For iOS, run `npx cap add ios` from frontend/ on macOS with Xcode, then sync and open with `npm run mobile:ios -w frontend`. Native project generation is intentionally explicit so the bundle ID can be finalized before store registration.

## Validation
`npm run typecheck` and `npm run build`. Then verify sign-in, course loading, assignments, focus, support, narrow screens, large text, and external lesson links on real devices. No offline synchronization, billing, new backend authorization or native media permission workflow is implied by the app shells.

## Design references
Figma UI/UX principles, Awwwards UI inspiration, and Anime.js official React integration informed the redesign. The artwork is original inline SVG. Stitch is not connected to this session and was not used. Student and mentor themes both have light/dark variants, a keyboard-accessible animated theme switch, and reduced-motion handling. New pages: welcome and learner overview. Existing detailed course, assignment, focus, authentication and support workflows remain connected; their internal layouts have not all been rebuilt. Parent and admin roles are not implemented by this frontend change.

## Account and download website
Run `npm run web:dev` for the website on port 5174. `npm run web:build` outputs frontend/dist-web/ for static hosting. The website only presents account creation, sign-in and a desktop download. Set VITE_WINDOWS_DOWNLOAD_URL in frontend/.env to a real HTTPS installer URL (or a same-origin /downloads/ path) before the web build. Until that URL is configured, the website truthfully shows download preparation instead of a broken button. App builds remain in frontend/dist/.

## Socket.IO
The backend HTTP server now also hosts /socket.io. Set REALTIME_ORIGINS to an explicit comma-separated list of deployed website/app origins. Localhost, Capacitor and Electron origins are configured for development. Configure Firebase Admin using Application Default Credentials (for local development, GOOGLE_APPLICATION_CREDENTIALS pointing to your private service-account file) and FIREBASE_PROJECT_ID. Never put service-account credentials in the frontend. Sockets fail closed when identity verification is unavailable; REST refreshes continue.
Clients send Firebase ID tokens to the existing API and Socket.IO handshake. Only small resource invalidation signals are sent; private task/user/prompt signals go to verified user rooms. Courses send catalog invalidations to verified connections. Clients refetch on reconnect and periodically resync tasks. Existing REST route authorization still needs a separate backend hardening pass; this change does not make the current REST API production-secure.

## Windows installer and website download
`npm run desktop:installer` builds the Windows installer. `node desktop/publish-download.mjs` copies the actual installer and a SHA-256 release manifest to frontend/web-public/downloads/. Rebuild the website after that; it discovers the real download through /downloads/latest.json. VITE_WINDOWS_DOWNLOAD_URL remains an optional hosted-download override. The installer is an unsigned development build; signing and production hosting have not been configured. Windows account creation is a shared Firebase ID, not a separate desktop account.

The original logo is retained in AppLogo.tsx, favicon.svg, Windows icon, and Android launcher icons. Packaging uses desktop-app/ for the isolated runtime bundle. In production, the Express static frontend defaults to frontend/dist-web, overridable with WEB_PORTAL_DIR.
