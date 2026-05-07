---
sidebar_position: 99
---

# Changelog

All notable changes to the NotifyKit API and platform.

---

## 2026-05-07

### Webhook HMAC signing

Webhook deliveries can now be signed with an HMAC-SHA256 signature. When a signing secret is configured, NotifyKit includes two headers on every delivery:

- `X-Webhook-Timestamp` — Unix timestamp (seconds) of when the delivery was made
- `X-Webhook-Signature` — `t=<timestamp>,v1=<hex>` HMAC-SHA256 signature

The signature is computed over `"<timestamp>.<JSON body>"` using your plaintext secret. Your endpoint reconstructs the same string and compares signatures to verify the delivery is genuine and the payload has not been tampered with.

To set up: go to **API Keys**, scroll to **Webhook Security**, and click **Generate**. The secret is shown once — store it securely. You can rotate or delete it at any time.

See [Webhook Security](/docs/guides/webhook-security) for verification examples and best practices.

### Webhook payload size limit

Webhook payloads are now capped at **10kb**. Requests exceeding this limit are rejected with a `400` error.

### Free plan: `usedProvider` always `null`

Free plan jobs always return `usedProvider: null` on delivery log entries. Previously, free plan customers could see which platform-level provider (SendGrid, Resend, Postmark) handled their delivery. This field is now reserved for paid plans using their own configured providers.

---

## 2026-05-04

### `deliveryLogs[]` on the SDK job-status endpoint

`GET /api/v1/notifications/jobs/:id` now returns a `deliveryLogs[]` array (one entry per delivery attempt) with the same shape exposed on `/api/v1/user/jobs/:id`. SDK callers can now read `usedProvider`, attempt number, status, and error message per attempt — previously this was dashboard-only.

`GET /api/v1/notifications/jobs` (the list endpoint) is intentionally unchanged: list responses stay slim.

### SDK `1.1.0`

`@notifykit/sdk@1.1.0` published with:

- `provider` and `fallback` on `SendEmailOptions` — pass them to `client.sendEmail()` for per-message provider routing.
- `JobStatus.deliveryLogs: DeliveryLog[]` — `client.getJob(id)` now returns the per-attempt history including `usedProvider`.
- New exported types: `EmailProvider`, `DeliveryLog`, `JobSummary`. `client.listJobs()` now returns `JobSummary[]` (the slim shape, accurate to what the API returns).

### Domain auto-registration when adding a provider

Adding a SendGrid, Resend, or Postmark API key in **API Keys** now automatically registers your existing custom domain with the new provider and writes its DNS records, so sends through that provider don't silently fail.

If new DNS records are required to finish verification, the system sends a **"DNS records needed for [Provider]"** email with the records inline and a link to the Domains page. The new pending entry also appears on the Domains page on next visit.

If Postmark is added without an account token, auto-registration is skipped (account token is only required for domain verification, not for sending). To verify a domain on Postmark, add the account token via **API Keys**.

### Domain verification warnings

`POST /api/v1/user/domain/request` now returns a `warnings: Array<{ provider, reason }>` field. The most common case: Postmark is configured but its **Account Token** is missing, so it's skipped during domain verification. The Domains dashboard renders these warnings as a yellow banner so the partial-success path is no longer silent.

---

## 2026-04-30

### Per-message provider routing + `usedProvider` on delivery logs

Paid-plan customers can now override the configured provider priority for a single email by passing `provider` (and optionally `fallback`) on `POST /api/v1/notifications/email`.

**What's new:**

- `provider` — force a single email through a specific configured provider (`SENDGRID`, `RESEND`, or `POSTMARK`). If it fails and `fallback` is unset, the job fails with no further attempts.
- `fallback` — second provider tried only if `provider` fails. Other configured providers are skipped.
- Routing fields persist with the job: manual or automatic retries replay the same restricted attempt set.
- Validation: `fallback` requires `provider`; the two must differ; both must reference configured providers; Free plan is rejected.
- `deliveryLogs[].usedProvider` — every delivery log entry now records which provider was used. Success rows record the delivering provider; failure rows record the last attempted provider. Pre-attempt failures and pre-migration rows are `null`.

**Breaking changes:** None. When `provider`/`fallback` are unset, behavior is unchanged — the worker tries the customer's full priority list with full failover.

See [Send Email — Per-Message Provider Routing](/docs/api-reference/send-email#per-message-provider-routing-paid-plans) and [Jobs — usedProvider](/docs/api-reference/jobs).

---

## 2026-04-28

### Postmark added as a third email provider

Postmark joins SendGrid and Resend as a fully supported provider — sending, BYOK, domain verification, and event tracking.

**What's new:**

- Connect a Postmark **Server Token** in **API Keys** alongside (or instead of) SendGrid and Resend.
- Optional **Account Token** field on the Postmark card — required only if you want to verify a custom sending domain through Postmark. Find it in Postmark under **Account → API Tokens**.
- Free-plan shared infrastructure now fans out across SendGrid, Resend, and Postmark with automatic failover.
- New webhook receiver at `POST /api/v1/webhooks/postmark/:customerId`. Postmark has no native HMAC signature — NotifyKit verifies inbound events via **HTTP Basic Auth**: configure your webhook in Postmark with the URL plus a Basic Auth password equal to the secret you set in **API Keys → Postmark → Event Tracking**.
- Postmark events map cleanly into NotifyKit's `EmailEvent` model: `Delivery → DELIVERED`, `Open → OPENED`, `Click → CLICKED`, `Bounce → BOUNCED`, `SpamComplaint → SPAM_REPORT`, `SubscriptionChange → UNSUBSCRIBED`.
- `EmailEventType.DEFERRED` was added to support providers that emit a deferred/temporary-failure event.

**Breaking changes:** None. Existing SendGrid + Resend configurations are untouched.

---

## 2026-03-29

### Multi-provider email support

NotifyKit now supports **SendGrid** and **Resend** as email providers, with automatic failover between them.

**What's new:**

- Connect a Resend API key alongside (or instead of) SendGrid in **Email Providers**
- Each provider gets its own sending domain registration and DNS records
- Providers are tried in priority order — if one fails (expired key, rate limit, outage), the next configured provider is used automatically on the same attempt
- Free plan: NotifyKit's shared infrastructure now uses both SendGrid and Resend as platform-level providers with automatic failover
- Domain verification now registers with all configured providers simultaneously — DNS records for each provider are shown in the dashboard

**Breaking changes:** None. Existing SendGrid-only configurations continue to work without any changes.

---

## Earlier

Initial release with:

- Transactional email via SendGrid (BYOK on paid plans, shared infrastructure on Free)
- Webhook delivery with automatic retries and exponential backoff
- Idempotent job submission
- Per-plan rate limiting and monthly quotas
- Custom sender domain verification (SendGrid)
- Delivery logs with per-attempt status tracking
- Job retry via dashboard and API
- GitHub OAuth
- Stripe and Paystack billing
