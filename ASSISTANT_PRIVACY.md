# Assistant privacy — Phase 2

Privacy controls are implemented in the main codebase. Open **Local assistant → Privacy settings**, including while signed out or while the backend is unavailable.

## Local choices

- **Allow local commands** is saved separately for each account on this device. Signed-out use has a separate setting. The default is on because the command model runs locally and never uploads a failed command.
- Disabling commands immediately cancels the current request. Main enforces the setting independently of the checkbox.
- **Clear current assistant data** cancels inference and clears the current input, proposal and unstarted assistant focus draft. It preserves saved learning records, downloaded models and the local preference.
- **Reset saved local choices** removes this account's preference file. Local commands return to their default on setting; cloud and web remain off.
- Missing files use defaults; corrupt or unreadable choices pause inference until reset. Stored JSON contains only a boolean, a revision and a notice version. Filenames are hashes; raw account IDs, prompts, proposals, credentials and history are not written.

The files are under the Electron app's user-data directory, in `assistant/privacy-v1`. They inherit the operating-system user's access permissions. Hashing filenames is not an authentication boundary or encryption. The renderer's local account selector chooses preference flags only and never authorizes access to a backend account.

Each binding has a fresh main-issued context token. Account switches, real document navigation, renderer failure, preference changes and cleanup cancel stale work. The preload exposes only named methods and a filtered change notification; it never exposes Electron event objects, filesystem paths or generic IPC.

## Account consent

Authenticated `/api/assistant/privacy` GET/PUT/DELETE endpoints manage only the caller's record, using the verified server identity. Client UID overrides are rejected. Revisions prevent concurrent updates from silently overwriting each other. The current notice is `2026-10-29.v1`.

Cloud AI and public web reading remain unavailable. The interface can save both as off or remove that record. It cannot collect a future grant for an unspecified provider. Deleting a record keeps both off. Future integration must ask again under its current notice and check provider/audience eligibility.

**All optional provider-backed AI endpoints are now paused on the server**, including previously configured providers. The denial happens before quota reservations or provider requests. This is deliberate: configuring an API key does not establish consent. The shared frontend also refuses agent requests before sending them, including when connected to an older backend. Restart/redeploy the backend to enforce the server-side controls for other clients. Core login, courses, focus sessions and progress APIs remain in place. Local commands do not need a backend connection or a provider key.

## Verification

Run the existing checks plus the privacy suite:

```text
npm run typecheck
npm run test:backend
npm run build
npm run test:assistant:electron
```

The privacy tests use temporary files, disposable databases and fixture identities. They check separate account choices, persistence, corruption/reset, stale tokens, cancellation, authenticated consent ownership, rejected grants, and zero provider/quota use when blocked. Electron/UI checks verify real opt-out persistence across reload, re-enabling commands, content clearing and preference deletion. They do not use a real account or paid provider.

Local history, authenticated-site browser profiles, Obscura browsing, cloud routing and signed release work remain outside Phase 2. Clearing current assistant data does not claim secure erasure of process memory or deletion of model downloads.
