# Local assistant — first implementation phase

Implemented for Windows x64: actual Needle 3 command proposals, a narrow Electron preload/IPC boundary, account-aware cancellation, local status in Settings, and a focus-form draft handoff. No provider key is needed for these commands. Existing backend/authentication services and their configuration remain in place.

Commands such as “open courses” and “prepare a 20 minute focus session on algebra” run locally. The result must be reviewed using **Use this action**. A focus proposal only fills the existing form; **Start session** still owns the actual authenticated save. Signed-out users must sign in before preparing a persisted focus session. There is no new offline account or course database.

## Use

On the development machine where this implementation was applied, the native engine and model have already been staged. Close/restart the development app after building:

```text
npm run desktop
```

Use **Local assistant** in the bottom corner. The website/mobile bundles do not import Electron or acquire native privileges. Their existing guide remains available. The new desktop assistant has no cloud or public-web operation enabled; existing cloud-backed learning features elsewhere in LOS retain their existing server configuration.

## Rebuild on another Windows x64 development machine

Install Python 3.14, install the repository's existing npm dependencies, then run:

```text
npm run assistant:setup
npm run build
```

Setup uses the exact official Hugging Face model revision and SHA-256 values in `native/needle/artifacts.lock.json`, and pinned build-tool versions. It compiles the standard-library C-ABI bridge with PyInstaller, smoke-tests it, and stages the full runtime, model and license notices. Native inference never installs packages or downloads weights at application startup. Python is needed on the build machine, not on the end user's machine.

The verified pair is Python acquisition package 3.2.1 / native engine 3.3.1 and model revision `d6c7d6a2e9655505e0f8e23339356dd1705900eb`. Those version numbers intentionally differ. The runtime invokes the C ABI directly, so it does not ship the acquisition package, Hugging Face client or training dependencies.

The `resources/native/` tree is ignored by Git and recreated by setup. `desktop/stage-native.mjs` hashes the shipped files into `desktop-app/native-manifest.json`; main verifies every file and rejects unexpected additions before running the worker. Missing or changed files disable commands while leaving core LOS available. Restart after setup or repair.

Setup preserves a previous native install under `build/assistant/previous-native`. It refuses to overwrite an existing backup or pending build. Review those directories before removing them. Do not replace model binaries while an app instance is running.

## Checks

```text
npm run typecheck
npm run test:backend
npm run test:assistant:python
npm run test:assistant:native
npm run build
npm run test:assistant:electron
```

`test:backend` includes contract, admission, stale-result and subprocess-failure tests. Python tests check refusal/normalization. Native smoke tests use the real frozen worker, DLL and weights. Electron checks use hidden windows and an isolated focus-service fixture: they verify main/preload access, wrong-window/document rejection, reload, real React proposal display, draft prefill, and no automatic focus writes. No real account or paid provider is used by these tests.

The build adds `preload.cjs` and the manifest to the existing staging package and stages native files with `extraResources`. Desktop TypeScript is now part of root typechecking. Missing optional native assets can still produce the core desktop build.

## Boundaries and remaining phases

- Every returned action is a proposal; the model cannot run shell commands, choose executables, read arbitrary files or write learner data.
- Prompts travel through stdin, not process arguments. The child receives a small environment without API keys, Node injection flags or inherited proxies. Telemetry is disabled, output is bounded and cancellation terminates the one-request process.
- Real document navigation and account changes invalidate in-flight work. The assistant is single-window and allows one native request at a time. Text and proposals are memory-only and cleared when closed/account-switched.
- The bridge uses the verified Needle 3 C ABI and omits high-level Python argument-repair helpers. Independent validation and user confirmation remain mandatory. The 0.4 confidence floor controls proposal availability; it grants no authority and is not a claim of semantic accuracy.
- Engine stdout reasoning is not returned or stored. Web content and provider keys never enter the local assistant.
- Obscura is not launched yet. Public browsing remains gated on Windows process containment, network-policy tests and reviewed resource acquisition. A child process alone is not a security sandbox.
- Stored cloud consent, audience eligibility, provider-wide Mongo quotas and free-tier routing are subsequent work. The new assistant does not silently upload unsupported commands.
- Existing unsigned installer settings have not been turned into a signed release. Code signing, installed-app tests and Windows CI remain release work.

Official sources: [Needle API](https://www.cactuscompute.com/blog/needle-python-docs), [C ABI implementation](https://github.com/cactus-compute/needle/blob/main/needle/_worker.py), [Electron security](https://www.electronjs.org/docs/latest/tutorial/security), [PyInstaller](https://pyinstaller.org/en/stable/usage.html).
