# Synapse apps

The React TypeScript UI is shared by web, Capacitor mobile, and Electron desktop. Navigation, account menus, touch sizing, reading surfaces, theme tokens, and safe-area spacing share one design system. Existing course and learning components remain connected.

## Setup
Use Node 22 or newer. Run `npm install` in the repository root.
Set the existing Firebase VITE variables and `VITE_BACKEND_URL=https://your-backend.example` in the root `.env` before building. This is a public backend address, never an API secret. Installed applications need a reachable backend; localhost on a phone refers to that phone. Configure Firebase authorized domains and backend CORS for the installed clients. The backend remains a separately deployed service.

## Desktop
`npm run desktop` builds and launches the installed-style app locally.
`npm run desktop:package` creates an unpacked app; `npm run desktop:installer` creates the host platform installer in release/. Signing and store distribution need platform credentials.

## Mobile
Run `npm run build -w frontend`, then `npx cap add android` from frontend/ once, followed by `npm run mobile:sync` from the root. Run `npm run mobile:android -w frontend` to open Android Studio. Install Android Studio, its SDK and the JDK required by your Capacitor version before generating an APK.
For iOS, run `npx cap add ios` from frontend/ on macOS with Xcode, then sync and open with `npm run mobile:ios -w frontend`. Native project generation is intentionally explicit so the bundle ID can be finalized before store registration.

## Validation
`npm run typecheck` and `npm run build`. Then verify sign-in, course loading, assignments, focus, support, narrow screens, large text, and external lesson links on real devices. No offline synchronization, billing, new backend authorization or native media permission workflow is implied by the app shells.
