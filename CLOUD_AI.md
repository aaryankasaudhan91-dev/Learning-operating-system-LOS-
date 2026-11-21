# Phase 4: explicit cloud learning questions

Implemented directly in LOS Version-2. Local Needle proposals and the contained
Obscura document reader remain separate. Cloud explanations use one fixed Groq
API endpoint, current consent, operator-owned eligibility and MongoDB quotas.
The deployment stays **off by default**. No real account was approved and no
live provider was contacted during implementation/testing.

## What users can do

An eligible signed-in adult can review **Settings → Assistant privacy**, enable
cloud questions, then open **Local assistant → Optional cloud explanation**.
They enter a question and optional context, select a help type, review the
recipient/model, check the per-question review box and press **Send to Groq**.

The backend receives exactly that question/context plus authorization, request
and consent metadata. It does not automatically attach account profiles,
learning records, local commands, page text, chat history or files. Users must
not include credentials, personal data about children or sensitive learner data.
Answers are displayed as untrusted React text and cannot execute app actions.

Closing the assistant, clearing assistant content, changing accounts or revoking
consent clears drafts/answers and cancels client work. The backend attempts to
abort provider work when the client disconnects or the current consent/eligibility
changes, and rechecks permission before returning an answer. Revocation cannot
recall bytes already sent to a provider. No local wipe claims secure memory or
disk erasure.

The old automatic `/api/agent/*` features remain denied, including wellbeing,
classroom interventions, generated tasks and legacy chat. They do not inherit
manual-question consent. Their active provider adapters were removed. Website
and mobile legacy chat remain blocked; the new question panel is in the desktop
assistant. Account privacy controls are shared.

## Provider and model routing

The verified endpoint is:

```text
POST https://api.groq.com/openai/v1/chat/completions
```

| Explicit task | Requested model |
| --- | --- |
| Brief explanation | `openai/gpt-oss-20b` |
| Hint | `openai/gpt-oss-20b` |
| Deeper explanation | `openai/gpt-oss-120b` |

The adapter uses separate system/user messages, `max_completion_tokens: 1024`,
`reasoning_effort: "low"`, `include_reasoning: false`, non-streaming output,
strict endpoint/redirect control a 25-second provider deadline and a 30-second request-wide admission/send deadline. It sends no
tools, search configuration or user-supplied provider/model/base URL. A response
must be bounded valid JSON with a completed final text choice. Reasoning, tool
calls, raw provider diagnostics and partial/truncated answers are not returned.

There are no automatic retries, alternate keys, alternate providers, paid
fallbacks or model substitution after a failure. A provider failure requires a
new explicitly reviewed question. A long reasoning answer can exhaust its
completion limit and fail rather than return an incomplete explanation.

### Free-plan limits are not a billing guarantee

Groq documents a Free plan, organization-level limits, account-specific limits
in its console, and paid Developer upgrades. Its current model list marks the
older Llama offerings as enterprise models; this implementation therefore uses
the documented production GPT-OSS IDs above.

The API does **not** expose a verified billing-plan or ZDR attestation through
the integration used here. The operator must confirm those settings in the
correct Groq organization before enabling this route, and keep them current.
A key belonging to an upgraded/billable organization can incur charges even
though the application has conservative caps. The application does not add a
payment method or upgrade the organization. Provider availability, model access
and limits can change. Re-review and disable the deployment when they do.

This route requires operator-confirmed Zero Data Retention. Groq documents
usage metadata retention and possible legal obligations; ZDR is not a promise
that no metadata or legally required data exists. Its data-location information
identifies US storage for retained customer data. The notice links the current
provider terms and data controls. No model-training or universal jurisdiction
claim is invented by this implementation.

## Operator setup

Do these steps through a trusted operational process. User-editable profile
fields, a self-reported birthday, a teacher role, renderer input and request
headers never establish eligibility.

1. Review Groq's service agreement, end-user age requirements, model access,
   supported geography, your deployment/audience and applicable data handling.
   This implementation conservatively permits only operator-verified adults
   with an explicit regional approval. It does not determine legal eligibility
   from an IP address or claim that an adult checkbox verifies age.
2. Confirm the **Free** plan and enable the required ZDR controls in the actual
   Groq organization. Check its account-specific quotas and reduce LOS limits
   below those values, accounting for other applications using the organization.
3. Set private values in `backend/.env` or the backend secret manager. Never put
   keys, Mongo credentials or these operational attestations in `VITE_*`.

```dotenv
GROQ_API_KEY=<private organization key>
CLOUD_AI_ENABLED=1
GROQ_FREE_PLAN_CONFIRMED=1
GROQ_ZDR_CONFIRMED=1
CLOUD_AI_POLICY_REVIEW=2026-10-29.groq-zdr.v1
GROQ_QUOTA_SCOPE=<stable-organization-label>
CLOUD_AI_ORG_RPM=10
CLOUD_AI_ORG_TPM=7000
CLOUD_AI_ORG_RPD=100
CLOUD_AI_ORG_TPD=100000
CLOUD_AI_USER_RPD=10
CLOUD_AI_PARALLEL=2
```

`GROQ_QUOTA_SCOPE` must identify the same organization across **all** backend
instances/keys using it. They must share the same MongoDB database. Do not rotate
this label or delete budget documents to reset limits. Traffic outside this
deployment is not magically counted by its database; provider 429 responses
remain authoritative. Invalid settings fail closed.

4. Through an authorized operator with private Mongo credentials, record a
   time-limited eligibility decision (maximum 90 days). Supply an actual account
   UID and a future expiry date; the example is a command pattern, not a grant:

```powershell
npm run cloud:eligibility -w backend -- grant ACCOUNT_UID YYYY-MM-DD --adult-verified --region-reviewed
npm run cloud:eligibility -w backend -- revoke ACCOUNT_UID
```

The CLI requires an existing account profile, stores only approval flags,
policy version and expiry, and exposes no HTTP grant endpoint. Verification
evidence and dates of birth are not stored in these records. Reviewers must use
an appropriate external verification process; running a command does not itself
verify someone's age or region.

5. Build/restart the backend and desktop app. The user must separately accept the
   displayed current notice. A configured key alone never enables a request.

```powershell
npm run build -w backend
npm run desktop
```

Do not change the local notice constant `ASSISTANT_PRIVACY_NOTICE` to migrate
cloud consent. Cloud uses a separate `CLOUD_AI_NOTICE` version. Provider, model,
retention or audience changes require a new notice version and operational
review; earlier records do not implicitly grant new permission.

## Modules and API

| File | Responsibility |
| --- | --- |
| `backend/src/cloud/policy.ts` | Deployment controls, bounded configuration and trusted adult/region eligibility. |
| `backend/src/assistant-privacy.ts` | Authenticated consent ownership, current notice, optimistic revisions and fresh grant tokens. |
| `backend/src/cloud/quota.ts` | Atomic organization-wide reservations, idempotency, rolling minute limits, daily limits, concurrency leases and cooldown. |
| `backend/src/cloud/provider.ts` | The only active cloud adapter, bounded responses and strict Groq routing. |
| `backend/src/cloud/routes.ts` | Validated manual question endpoint, permission checks, disconnect/revocation cancellation and sanitized errors. |
| `backend/src/cloud/manage-eligibility.ts` | Operator-only eligibility CLI. |
| `cloud-assistant.service.ts` | Account-bound consent preflight before uploading a question. |
| `AssistantCloud.tsx` | Explicit question preview/review/send, cancellation and plain text answers. |
| `AssistantPrivacySettings.tsx` | Notice, eligibility status, opt-in, revoke and remove controls. |

The new request is `POST /api/assistant/cloud/explain`, protected by existing
backend identity verification and database readiness. It accepts only:

```typescript
{
  requestId: string;       // UUID v4, newly generated for each explicit submission
  noticeVersion: string;   // exactly CLOUD_AI_NOTICE
  consentRevision: number;
  grantToken: string;      // current backend-issued consent binding
  task: 'explain' | 'hint' | 'deep-explain';
  prompt: string;          // at most 2,000 characters
  context?: string;        // at most 2,000 characters
}
```

Combined prompt/context is also capped at 4,000 UTF-8 bytes. UID, provider,
model, endpoint, files and webpage payload fields are rejected. Identity comes
from the verified bearer session. The grant token is not authentication by
itself: it is always checked against that identity's current record. It prevents
deleting/recreating a revision-1 consent record from reviving a previously
admitted request. Responses contain final text, provider and requested model.

Client requests also stop if the account changes while an authentication token
is being resolved. Consent mutations clear current content before the request
and notify the UI again after the server commit, avoiding stale grant displays.

## Shared quotas and metadata

One MongoDB organization document uses revision-based compare-and-swap to
reserve **all dimensions together**. It supports standalone MongoDB and does
not fall back to process-local counters or unprotected read/increment logic.
MongoDB's clock determines its windows so independent backend clocks cannot
reset a day backwards. Reservations cover:

- Organization requests/tokens in a rolling minute and UTC calendar day.
- Per-user UTC daily requests and a three-request rolling-minute burst cap.
- Active provider attempts with 60-second crash-recovery leases.
- Hashed account/request IDs for 48-hour replay prevention.
- Shared provider cooldown on 429, with bounded Retry-After handling.

Input reservation uses a conservative UTF-8 byte/framing bound plus the full
completion allowance, including reasoning. It is deliberately stricter than
actual token usage, not exact billing reconciliation. Failures, timeouts and
cancellations consume their reserved allowance; they are not refunded. Only the
active slot is released. Process crashes can hold it until its lease expires.
Database failures prevent admission. Cooldown and release updates require the
shared database; an outage can delay completion/recovery.

The database stores consent/eligibility identities and quota metadata, not
questions, context, reasoning or answers. Quota user/request identifiers are
hashed pseudonyms, not anonymization. Expired attempt/event entries are pruned
on subsequent budget operations; idle organization budget documents have a
three-day `updatedAt` TTL index (Mongo cleanup is asynchronous). Removing consent
does not refund or erase abuse-prevention quota counters. No cloud conversation
history is saved by this feature.

Keep the existing backend database indexes and synchronized server time in
production. Protect Mongo credentials, TLS and logs operationally; do not add
request-body logging around the cloud endpoint.

## Verification

```powershell
npm run test:assistant:cloud
npm run test:backend
npm run typecheck
npm run build
npm run build -w backend
npm run test:assistant:electron
```

Tests use temporary MongoDB and fixture identities; provider requests are
intercepted with fake responses. They cover current consent, eligibility expiry,
forged fields, account isolation, delete/regrant replay, approved models, byte
and output limits, atomic contention, per-user/day/minute caps, cooldown, failed
responses, no stored prompt data, revocation and no alternate-provider retry.
Electron tests exercise the actual components with a fixture HTTP layer and
verify no upload before both consent and per-question review, safe text display,
revocation clearing, old-backend refusal and an account change during token
resolution. These tests do not establish live provider/account availability.

Signed Windows installers, complete third-party release notices, final installed
upgrade checks and release CI remain Phase 5.

## Official sources reviewed on 2026-10-29

- [Groq supported models](https://console.groq.com/docs/models)
- [Groq API reference](https://console.groq.com/docs/api-reference)
- [Groq rate limits](https://console.groq.com/docs/rate-limits)
- [Groq billing and Free/Developer plans](https://console.groq.com/docs/billing-faqs)
- [Groq service agreement](https://console.groq.com/docs/legal/services-agreement)
- [Groq data handling and ZDR](https://console.groq.com/docs/your-data)

Configuration confirmations are operator attestations to the reviewed settings,
not a claim that LOS queried or independently verified those account settings.


Windows release pipeline and unsigned installer validation are now implemented in Phase 5. Actual production signing and redistribution approval remain pending; see WINDOWS_RELEASE.md.
