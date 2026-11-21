# Phase 5: Windows release pipeline

The release pipeline is implemented in the main repository. Unsigned review
installers are available for local validation. A publicly distributable signed
release is **not complete**: no signing certificate/tool configuration or
completed redistribution-rights review was available on this machine.

Nothing was published, pushed, committed, uploaded to the website or submitted
to a certificate service. The root application version remains `0.2.0`; higher
review versions were used only to test upgrade behavior.

## Commands

```powershell
npm run test:release
npm run typecheck
npm run test:backend
npm run release:review
npm run release:verify -- build/windows-review-0.2.0
```

`release:review` builds a separate **Synapse Review** application with app ID
`com.synapse.los.review`, an `UNSIGNED-REVIEW` installer name and a separate user
profile. It is not the production Synapse identity. Assisted NSIS installation
is per-user, does not request elevation, does not automatically start the app,
and preserves app data on uninstall. Review shortcuts are not created.

Candidate output is under `build/windows-review-VERSION`. Earlier candidates
are never silently overwritten. To create a distinct version for upgrade tests,
set `LOS_REVIEW_VERSION` in the current shell; this does not edit package.json:

```powershell
$env:LOS_REVIEW_VERSION='0.2.1'
npm run release:review
npm run release:test-install -- build/windows-review-0.2.0 build/windows-review-0.2.1
Remove-Item Env:LOS_REVIEW_VERSION
```

Use actual existing candidate versions. The local final checks used review
versions recorded in their `installer-verification.json` files. Test installs
go into newly allocated `build/installer-checks/review-*` directories. They do
not install over normal Synapse. A single canary file in the review profile is
used to prove that upgrade/uninstall preserve profile data; the test removes
only its own canary, not other profile contents. Failed installation directories
are left for diagnosis rather than recursively removing a potentially live app.

## Release modules

| File | Responsibility |
| --- | --- |
| `scripts/release/windows.mjs` | Separate review/signed modes, pinned tool versions, isolated inputs, license review, native signing, manifest regeneration, NSIS and hash evidence. |
| `scripts/release/policy.mjs` | Production origin and signer path-boundary validation. |
| `scripts/release/notices.mjs` | Exact staged application/native hashes, installed npm notice inventory, Electron notices and explicit unresolved findings. |
| `scripts/release/sign-file.ps1` | Windows certificate-store/SignTool adapter, approved thumbprint, SHA-256, RFC 3161 timestamp and signature read-back. |
| `scripts/release/sign.cjs` | electron-builder signing hook; already-signed native bytes are verified instead of signed a second time. |
| `scripts/release/verify-package.mjs` | Artifact/native hash verification, packaged content checks, hardened fuse checks, signature checks and offline executable startup. |
| `scripts/release/test-install.mjs` | Actual silent review install, version upgrade, canary preservation, tamper refusal and uninstall. |
| `desktop/release-check.ts` | Fixed offline maintenance check using the real packaged Needle/Obscura runtime. |
| `.github/workflows/windows-release.yml` | Hosted unsigned validation and a separately protected Windows signing job. |

`desktop:installer` now invokes the guarded signed release command. The older
`desktop:package` command remains a development unpacked build; it is not the
production release process.

## Packaging and integrity

Electron `42.11.18`, electron-builder `26.15.3`, esbuild `0.25.12`, ASAR and fuse
tools are pinned to the installed/locked versions. `npm ci` is the dependency
installation path. The builder configuration is written as a standalone JSON
file: passing a config object would concatenate package.json resource arrays,
causing duplicate native copies and potentially mixed signed/unsigned inputs.

The pipeline copies generated desktop files and native binaries into the
candidate's `input` directory. It does not sign or replace development native
resources in place. In signed mode it:

1. Verifies operational/signing prerequisites and builds with the chosen HTTPS
   backend origin.
2. Generates a digest of the staged application, unsigned native inputs, lock
   file and notice inventory. Requires a matching completed rights review.
3. Signs native PE files that do not already carry a trusted vendor signature.
   Existing valid vendor signatures are preserved on inventory-reviewed bytes.
4. Regenerates `native-manifest.json` **after** signing, so runtime hashes match
   the actual shipped signed bytes.
5. Builds ASAR/NSIS, applies Electron fuses and signs the main app, uninstaller
   and installer through the checked signing hook.
6. Requires package verification before any distribution decision.

The signing hook verifies native copies without modifying their signatures a
second time. Package verification compares every native file against the
manifest inside ASAR and checks all output artifact hashes. Its ASAR scan
rejects environment files, server directories and installed node_modules in the
desktop payload. This is a structural check, not a claim to detect every secret
that a developer could embed in application source.

Release fuses disable RunAsNode, NODE_OPTIONS and Node CLI inspection, enable
cookie encryption, require loading the app from ASAR and enable embedded ASAR
integrity validation. The verifier reads the fuse wire from the actual EXE.
Neither hashes nor ASAR integrity alone replace a trusted publisher signature.

## Installed offline maintenance check

The packaged executable supports one fixed operation:

```powershell
& 'PATH\TO\Synapse.exe' --verify-installation
```

It acquires the application's single-instance lock, refuses to interfere with
an already running app, verifies native files, performs a contained offline
Obscura startup smoke check, and asks Needle to propose opening Courses. It
does not apply that action, contact a provider, fetch a website, load an account
or accept arbitrary URLs, paths, scripts or commands. Temporary check files are
removed. Its machine-readable stdout begins `LOS_RELEASE_CHECK=`.

The installer tests launch this actual EXE with no developer PATH/Python and a
small set of standard Windows profile variables. Native workers still receive
their own restricted environment. The checks use the bundled runtime and do
not require Python to be installed on an end user's machine. They verify a
native tamper failure followed by successful restoration.

The tests cover startup/native execution and automated UI regression checks
separately. They do not claim a full manual visual/accessibility review of every
installed screen or an automatic-update service. Upgrade testing uses two NSIS
versions installing to the same isolated target.

## Signing prerequisites

The implemented adapter uses a code-signing certificate/private-key provider
already available through the Windows **CurrentUser\My** store (including a
properly configured/preauthenticated HSM provider). It does not export private
keys, accept a private key in source, or place a password on a command line.
Other signing services require their own verified adapter/configuration; this
implementation does not assume an Azure API or silently switch providers.

Configure the protected signing host with:

```powershell
$env:LOS_RELEASE_BACKEND_ORIGIN='https://YOUR-PRODUCTION-BACKEND'
$env:LOS_SIGNING_THUMBPRINT='APPROVED_40_HEX_CHARACTER_CERTIFICATE_THUMBPRINT'
$env:LOS_SIGNTOOL_PATH='ABSOLUTE\PATH\TO\WINDOWS-SDK\signtool.exe'
$env:LOS_LICENSE_REVIEW_FILE='ABSOLUTE\PATH\TO\COMPLETED-REVIEW.json'
npm run release:preflight
npm run release:windows
npm run release:verify -- build/windows-signed-0.2.0
```

Values above are patterns, not usable credentials. Never send a private key or
password in chat or commit one. The public thumbprint identifies the approved
publisher. The script requires the correct EKU, current certificate validity,
private-key access for signing, SHA-256 and a valid timestamped Authenticode
signature from that thumbprint. Verification alone does not need the private
key. The child PowerShell execution-policy setting applies only to that trusted
build-script process; no machine-wide execution policy is changed.

The signing timestamp must be obtained successfully; there is no unsigned
fallback. The signed path sets `forceCodeSigning: true`, while unsigned review
mode is visibly distinct. A locally trusted/self-signed certificate is not a
substitute for a suitable public-distribution certificate. Successful signing
does not guarantee SmartScreen reputation or universal trust on other machines.
The signing-positive path still needs validation with the actual chosen
certificate/provider; no real signature was produced in this implementation run.

Both review and signed-candidate evidence deliberately retain
`productionReady: false`: publication is a separate explicit release decision.
No workflow creates a GitHub Release or uploads binaries to the website.

## Licenses and unresolved rights review

`npm run release:notices` creates `build/release-notices` from current staged
build inputs. It collects root LICENSE/COPYING/NOTICE text for installed npm
packages, the existing native notices, and Electron's LICENSE and Chromium
license bundle. The npm list is deliberately overinclusive (some entries are
build/server-only). It is **not** a claim of a complete native SBOM.

The current inventory has 769 installed npm entries, 69 native files and 48 npm
entries without root notice text. It explicitly flags:

- Obscura's missing complete Rust/V8/transitive notice bundle.
- Needle engine/model and linked-native redistribution terms.
- CPython, OpenSSL, libffi, zstd, Microsoft CRT and PyInstaller notices/exceptions.
- Statically linked MinGW/GCC runtime notices/exceptions.
- Application/assets distribution rights (no application license was invented).
- npm notice gaps, including deciding which are shipped versus build-only.

Review the actual `inventory.json`; counts can change with dependencies. Obtain
missing authoritative notices and place redistributable additions under
`desktop/release/legal/`. Regenerate the inventory after additions. A qualified
rights reviewer must complete the example review schema with the exact digest,
reviewer/date and evidence resolving every finding. The implementation does not
fill in a fictitious approval or infer redistribution permission from a model
name or benchmark.

By default the completed file is `desktop/release/license-review.json`, or use
`LOS_LICENSE_REVIEW_FILE` on a protected host. A stale inventory digest, pending
status or unresolved finding blocks signing. Any change to staged app/native
bytes or notice inputs requires the matching review to be refreshed. Review
evidence is an operator attestation, not an automated legal opinion.

## CI and release evidence

The existing Ubuntu CI now includes the release guard tests.
`windows-release.yml` is manually dispatched:

- **review** uses a hosted Windows 2025 runner, Node 22, Python 3.14.3 and a
  fixed WinLibs GCC 15.2.0 archive verified by SHA-256 before execution. It builds
  pinned native inputs, runs regression/native/UI checks, creates two installer
  versions and performs the real installation lifecycle tests.
- **signed** requires a clean dedicated runner labeled `los-signing`, the
  protected `windows-production-signing` environment and a tag exactly matching
  package.json. Configure required reviewers and restrict allowed deployment
  refs in GitHub settings; YAML cannot create those protections by itself.
  `LOS_APPROVED_NATIVE_ROOT` must point to immutable reviewed unsigned native
  inputs outside the checkout, with the matching completed rights-review file.
  Copy reviewed inputs before building; do not rebuild them after approving a
  digest. The signing key/provider stays on that protected host.

Workflows were syntax-checked locally, not dispatched or proven on a remote
runner. The pinned compiler download was selected from official release metadata;
the hosted CI download/build still needs its first actual run. Signing CI remains
unexecuted until its runner, certificate, production origin and rights review are
configured.

Candidate directories contain `release-evidence.json` with artifact/native/lock
hashes, then `package-verification.json` and `installer-verification.json` after
their respective checks. Checks use no learner account or paid provider. Keep
failed candidates/evidence until reviewed; choose a fresh review version rather
than overwriting them.

## Sources verified

- [electron-builder hooks](https://www.electron.build/v26/docs/features/hooks/)
- [Windows options](https://www.electron.build/v26/docs/win/)
- [NSIS options](https://www.electron.build/nsis/)
- [Electron fuses](https://www.electronjs.org/docs/latest/tutorial/fuses)
- [Microsoft SignTool](https://learn.microsoft.com/en-us/windows/win32/seccrypto/signtool)
- [Microsoft timestamping](https://learn.microsoft.com/en-us/windows/win32/seccrypto/adding-time-stamps-to-previously-signed-files)
- [Pinned WinLibs GCC release](https://github.com/brechtsanders/winlibs_mingw/releases/tag/15.2.0posix-14.0.0-ucrt-r7)

The local electron-builder 26.15.3 implementation was inspected to verify its
actual `signtoolOptions.sign`, extraResources transformation and fuse/sign order;
newer documentation using a different signing configuration was not assumed to
apply to this pinned version.
