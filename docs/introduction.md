---
sidebar_position: 1
---

# Introduction

NotifyKit is notification infrastructure for modern applications. Send emails and webhooks through one API — a Redis-backed queue handles delivery, retries, and observability so your server never blocks and nothing disappears silently.

### What is NotifyKit?

Most applications eventually need to send emails and trigger webhooks — for order confirmations, password resets, event notifications, and more. The infrastructure behind reliable delivery adds up fast: async queues, retry logic, dead-letter handling, deduplication, delivery logs, provider failover, domain setup.

NotifyKit handles all of that behind a clean API. You make one call; NotifyKit queues it, delivers it in the background, retries on failure, and logs every attempt.

### What NotifyKit Handles

- **Multi-provider email failover** — connect multiple email providers with a priority order; if one fails or goes down, NotifyKit automatically routes to the next with no code changes required
- **Async job queue** — your API call returns immediately (under 100ms); a pool of background workers handles actual delivery
- **Job priorities** — CRITICAL, NORMAL, and LOW lanes; critical jobs skip the line and are never delayed by batch workloads
- **Automatic retries** — exponential backoff across up to 3 attempts, with smart 4xx detection for webhooks (bad payloads don't get retried)
- **Dead-letter queue** — jobs that exhaust all retries move to a DLQ, never discarded; re-queue any failed job with one API call
- **Idempotent delivery** — no accidental double-sends; attach an idempotency key and retry freely from your side
- **Delivery logs** — per-attempt visibility: HTTP status, response body, error message, timestamp, and which provider was used
- **Domain verification** — verify a custom sender domain across all configured email providers from the dashboard
- **Per-plan rate limiting and monthly quotas**

### What NotifyKit Sends

**Emails** — Send transactional emails via your configured email providers. On the Free plan, emails go through NotifyKit's shared infrastructure with automatic failover across supported providers. On paid plans, connect your own API keys (BYOK — bring your own key), giving you full control over deliverability, sender reputation, and sending limits. NotifyKit delivers through your configured providers in priority order and falls back automatically on failure. Paid plans can also force a single email through a specific provider — with an optional fallback — on a per-message basis.

**Webhooks** — Deliver HTTP callbacks to any endpoint, with custom headers and a configurable payload. 5xx and network errors trigger exponential backoff retries; 4xx errors fail immediately (a bad payload won't fix itself). All retry and dead-letter behavior applies equally to webhooks.

### Plans

| Plan    | Price     | Monthly Limit     | Emails                                 |
| ------- | --------- | ----------------- | -------------------------------------- |
| Free    | $0        | 100 notifications | Shared with webhook quota              |
| Indie   | $5/month  | 4,000 webhooks    | Unlimited (via your own provider keys) |
| Startup | $10/month | 15,000 webhooks   | Unlimited (via your own provider keys) |

On the Free plan, every notification (email or webhook) counts toward a single 100/month limit. On paid plans, emails are unlimited and only webhooks count toward the monthly quota.

### Quick Example

```typescript
import { NotifyKitClient } from "@notifykit/sdk";

const client = new NotifyKitClient({
  apiKey: process.env.NOTIFYKIT_API_KEY!,
});

// Send an email — NotifyKit queues it, delivers via your configured providers(based on email client priority),
// and retries automatically if one fails
const emailJob = await client.sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  body: "<h1>Hello World</h1>",
  priority: 5,
  idempotencyKey: "welcome-user-123",
});

console.log("Email queued:", emailJob.jobId);

// Force a specific provider with a fallback for high-stakes emails
const paymentEmail = await client.sendEmail({
  to: "user@example.com",
  subject: "Payment Confirmed",
  body: "<p>Your payment has been processed.</p>",
  priority: 1,
  provider: "SENDGRID", // try this provider first
  fallback: "RESEND", // fall back to this if SENDGRID fails
  idempotencyKey: "payment-confirm-order-456",
});

// Send a webhook
const webhookJob = await client.sendWebhook({
  url: "https://your-app.com/webhooks/events",
  payload: {
    event: "user.signup",
    userId: "123",
  },
  idempotencyKey: "signup-webhook-123",
});

console.log("Webhook queued:", webhookJob.jobId);
```

### Next Steps

- [Installation](/docs/getting-started/installation) — Install the SDK
- [Quick Start](/docs/getting-started/quickstart) — Send your first notification
- [API Reference](/docs/api-reference/authentication) — Explore the full API
