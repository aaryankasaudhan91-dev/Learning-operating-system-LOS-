# Phase 3: controlled public document reader

Implemented in the main LOS Version-2 codebase on 2026-10-29. Needle still handles
local command proposals; Obscura extracts text from a separately approved public
document; cloud AI remains off by default and server-side browsing remains disabled. Phase 4 manual cloud questions are documented in CLOUD_AI.md. No paid browser
service, API key, login, proxy service or cloud model is used by this reader.

## Use and build

From this repository, run:

```powershell
# Build machine only: Windows x64, Python 3 and x64 MinGW GCC 15.2.0.
npm run assistant:setup:web
npm run test:assistant:containment
npm run build
npm run test:assistant:electron
npm run desktop
```

The existing Needle installation is also required. End users need neither GCC
nor Python. Open **Local assistant → Read a public page**, enter an approved
address, then approve the separate native dialog. Cancel is the default. Every
read needs its own approval; no earlier account consent record grants this
permission. Turning off local command inference does not grant or revoke a page
request. Clear current assistant data, account changes, reloads and closing the
assistant clear displayed page data and cancel outstanding work.

Allowed initial hosts are `en.wikipedia.org`, `developer.mozilla.org` and
`www.khanacademy.org`. Only HTTPS on port 443 is accepted, without credentials,
queries or fragments. For example:
`https://developer.mozilla.org/en-US/docs/Web/JavaScript`.

## Modules and trust boundaries

| Module | Responsibility |
| --- | --- |
| `native/obscura/artifacts.lock.json` | Pin Obscura 0.2.5, upstream commit, Windows no-render archive checksum and Apache license checksum. |
| `scripts/setup-obscura.py` | Verify downloads; extract only `obscura.exe`; compile the static x64 containment host; preserve the previous installation under `build/obscura`; prepare read permissions. |
| `native/obscura/reader-host.c` | Create an AppContainer without any capabilities; start only the adjacent binary suspended; verify its token; assign its bounded Job Object; resume; remove its profile. |
| `desktop/assistant/web-policy.ts` | Conservative public IPv4 and robots rules, without page-controlled regular expressions. |
| `desktop/assistant/web-fetch.ts` | Main-process HTTPS broker, independent DNS validation, address pinning, redirect admission, robots enforcement and bounded responses. |
| `desktop/assistant/web-reader.ts` | Temporary document lifecycle, offline native extraction, cancellation, startup recovery and safe result normalization. |
| `desktop/assistant/runtime.ts` | Manifest verification, real contained startup smoke check and shared reader admission. |
| `desktop/assistant/ipc.ts` | Exact window/document/main-frame checks, current privacy token, bounded request, native approval and shared session cancellation/rate limits. |
| `desktop/preload.ts` | One named `readPage(url,id,context)` method; no renderer access to commands, paths, JavaScript evaluation, processes or IPC generally. |
| `AssistantWebReader.tsx` | Input, cancellation, source/time/status, untrusted plain text display, truncation notice and clear action. |

The renderer cannot supply an executable, native arguments, file path, proxy,
environment variable, script or approval response. Page text is React text inside
`pre`; it is never inserted as HTML, executed as a command, fed into Needle, or
uploaded to a model. Account identity is used only to select existing local
preference flags. HTTP requests contain no Firebase bearer token or browser
cookies. Cookies returned by websites are discarded, including across redirects.

## Network behavior

LOS requests `robots.txt`, then the approved document. The website sees the
user's IP address, requested paths and `LOSReader/1.0` user agent. Redirects must
remain on the same approved HTTPS origin; every redirected path is checked
against robots before requesting it. A missing robots file (404) permits reading;
denial, unexpected status or malformed supported rules fails closed. Robots is
a conservative subset of RFC 9309, not a claim of complete standards support.

DNS requests IPv4 results only. All returned addresses must be public; any
private, loopback, link-local, multicast or listed special-use result rejects the
request. The selected result is pinned into the socket lookup while the original
hostname remains the TLS certificate/SNI identity. Each redirect receives a new
check. IPv6-only sites are intentionally unavailable in this version.

The broker accepts successful UTF-8 HTML/plain text only, with a 2 MiB body cap,
128 KiB robots cap, no compressed responses, a socket idle timeout and a 22-second
overall read deadline. It follows at most three redirects. Pages that ignore
identity encoding, block automated clients, exceed limits or need an online
JavaScript session can fail normally. HTTP final URL/status come from the
broker, rather than being guessed from CLI text.

Obscura receives only the downloaded local file. It receives **zero network
capabilities**, so redirecting scripts, images, frames, XHR, WebSocket and other
page requests cannot bypass the broker. No CDP server or local web endpoint is
opened. This is an offline document reader, not a full online browser: external
assets, remote scripts, linked pages and network-rendered content are absent.

## Windows containment and cleanup

The trusted launcher uses the documented `SECURITY_CAPABILITIES` process
attribute and a registered AppContainer profile. It verifies that the child
really has an AppContainer token with the expected SID and zero capabilities
before resuming it. Only standard I/O handles are inherited; the Job Object
handle is not. No provider keys, account token, parent PATH or arbitrary parent
environment is inherited.

The job enforces one active process, 1 GiB committed process memory, a 10-second
user CPU budget, kill on last job handle close, and a 15-second launcher wait.
Main also bounds output and elapsed time. The single-process limit prevents the
browser from launching `obscura-worker.exe` or another executable. Only
`obscura.exe` and the launcher are installed; the unused worker is omitted.

The downloaded document is briefly written below Electron userData's
`assistant/web-work/read-*` directory. The AppContainer receives read access to
that directory/file and read/execute access to its browser binary. It cannot
modify that document. Ordinary Windows AppContainers can also read resources
granted to all application packages; this does not claim a filesystem containing
only one file. A native probe checks that a private canary outside the job is
unreadable on the test machine.

Successful reads remove the job directory and AppContainer profile. Cancelling
kills the launcher; closing its job handle kills the browser. Main then removes
the profile and directory before admitting more work. Failed cleanup disables
further reads. Startup removes interrupted reader work before its smoke check.
An application/OS crash can leave temporary data until the next successful
startup; deletion is not secure disk erasure. No assistant history is deliberately
persisted. Profile identity is scoped to the native installation path so a test
copy or another installation cannot clean up this installation's profile.

The setup-time `--prepare` command grants only the derived AppContainer SID
read/execute permission on the runtime folder and browser executable. A future
installer must establish suitable read ACLs at its final install location. Startup can repair these read/execute permissions at user-writable install locations after verifying the native hashes. If the smoke check and repair fail, the reader remains unavailable.

## Tests and operational limits

```powershell
npm run test:assistant:web
npm run test:backend
npm run test:assistant:containment
npm run test:assistant:electron
npm run typecheck
npm run build
```

Policy tests cover rejected addresses/schemes/credentials/hosts, mixed public and
private DNS, rebinding between redirects, blocked paths before requests, redirect
loops, robots rules, cancellation during DNS, bad status/type/encoding and size
limits. The native probe checks the actual token/capabilities, a private file
canary, document write denial, public socket denial, an unreachable known-live
loopback listener, child-process denial, job limits, clean environment and
kill-on-close. The real pinned browser also reads hostile offline markup without
its image/frame/script requests reaching that listener. The probe is a test
fixture and is never packaged.

Electron checks use the real preload and app UI. The test process substitutes
the native dialog's decision and document result only in its own main process
for deterministic acceptance/cancellation and safe-rendering checks; production
has no such override. The separate live smoke check returned HTTP 200 and 6,007
characters from MDN's JavaScript documentation through the actual broker and
contained engine.

Phase 3 also fixes a privacy event ordering race: a late invalidation now names
its previous context token, and cannot erase a fresh account binding. Delayed
preference updates cannot replace a newer preference revision.

This is a development integration, not a signed release. Phase 4 cloud routing, eligibility, explicit cloud consent and shared quotas are now implemented in CLOUD_AI.md. Phase 5
still owns signing, final-install ACL checks, installer/upgrade CI and a complete
third-party license/notice inventory. The upstream release ZIP supplies binaries
only; the included upstream Apache license does not substitute for that inventory.

## Verified upstream interfaces

- [Obscura 0.2.5 release](https://github.com/h4ckf0r0day/obscura/releases/tag/v0.2.5)
- [Pinned CLI source](https://github.com/h4ckf0r0day/obscura/blob/bd9529418b7fa975b50eabeac415cfaaa865a588/crates/obscura-cli/src/main.rs): `fetch file://… --dump text --wait 0 --timeout 10 --quiet`; fetch explicitly permits local file input.
- [Microsoft process attributes](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute)
- [AppContainer profiles](https://learn.microsoft.com/en-us/windows/win32/api/userenv/nf-userenv-createappcontainerprofile)
- [AppContainer isolation](https://learn.microsoft.com/en-us/windows/win32/secauthz/appcontainer-isolation)
- [Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects)

No undocumented Obscura stdin protocol, guessed browser API or claimed
`--sandbox` flag is used.


Windows release pipeline and unsigned installer validation are now implemented in Phase 5. Actual production signing and redistribution approval remain pending; see WINDOWS_RELEASE.md.
