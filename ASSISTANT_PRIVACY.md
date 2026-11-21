# Assistant privacy — Phase 2

Privacy controls are implemented in the main codebase. Open **Local assistant → Privacy settings**, including while signed out or while the backend is unavailable.

## Local choices

- **Allow local commands** is saved separately for each account on this device. Signed-out use has a separate setting. The default is on because the command model runs locally and never uploads a failed command.
- Disabling commands immediately cancels the current request. Main enforces the setting independently of the checkbox.
- **Clear current assistant data** cancels inference and clears the current input, proposal, public-page text and unstarted assistant focus draft. It preserves saved learning records, downloaded models and the local preference.
- **Reset saved local choices** removes this account's preference file. Local commands return to their default on setting; cloud consent is managed separately; public pages still require separate permission for each request.
- Missing files use defaults; corrupt or unreadable choices pause inference until reset. Stored JSON contains only a boolean, a revision and a notice version. Filenames are hashes; raw account IDs, prompts, proposals, credentials and history are not written.

The files are under the Electron app's user-data directory, in `assistant/privacy-v1`. They inherit the operating-system user's access permissions. Hashing filenames is not an authentication boundary or encryption. The renderer's local account selector chooses preference flags only and never authorizes access to a backend account.

Each binding has a fresh main-issued context token. Account switches, real document navigation, renderer failure, preference changes and cleanup cancel stale work. The preload exposes only named methods and a filtered change notification; it never exposes Electron event objects, filesystem paths or generic IPC.

## Account consent

Authenticated `/api/assistant/privacy` GET/PUT/DELETE endpoints manage only the caller's record, using the verified server identity. Client UID overrides are rejected. Revisions prevent concurrent updates from silently overwriting each other. The local preference notice remains `2026-10-29.v1`. Cloud consent now uses the separate current notice `2026-10-29.groq-zdr.v1`; see CLOUD_AI.md.

Phase 4 adds optional, explicitly reviewed cloud questions to Groq for operator-approved adults with current consent. It is off by default and does not enable server-side web access. Earlier off records never become grants. Removing consent turns cloud access off, and a fresh grant token prevents old requests reviving after deletion/recreation. Desktop public document reading still uses its own native approval per read; see PUBLIC_WEB_READER.md and CLOUD_AI.md.

**Legacy automatic AI endpoints remain paused on the server**, including previously configured providers. Phase 4 provides a separate manual-question endpoint with eligibility, current consent and organization-wide quotas. The denial happens before quota reservations or provider requests. This is deliberate: configuring an API key does not establish consent. The shared frontend still refuses legacy agent requests before sending them, including when connected to an older backend. The new cloud question flow checks the current backend consent contract before uploading a question. Restart/redeploy the backend to enforce the server-side controls for other clients. Core login, courses, focus sessions and progress APIs remain in place. Local commands do not need a backend connection or a provider key.

## Verification

Run the existing checks plus the privacy suite:

```text
npm run typecheck
npm run test:backend
npm run build
npm run test:assistant:electron
```

The privacy tests use temporary files, disposable databases and fixture identities. They check separate account choices, persistence, corruption/reset, stale tokens, cancellation, authenticated consent ownership, rejected grants, and zero provider/quota use when blocked. Electron/UI checks verify real opt-out persistence across reload, re-enabling commands, content clearing and preference deletion. They do not use a real account or paid provider.

Local history, authenticated-site browser profiles and signed release work remain outside this implementation. Phase 4 cloud routing is documented in CLOUD_AI.md. Phase 3 adds contained offline Obscura document extraction, brief temporary files with cleanup, and untrusted plain text display. Clearing current assistant data does not claim secure erasure of process memory or deletion of model downloads.
