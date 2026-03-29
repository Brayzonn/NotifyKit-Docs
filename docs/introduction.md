---
sidebar_position: 1
---

# Introduction

NotifyKit is a simple, affordable notification infrastructure for indie developers, small teams, and startups.

### What is NotifyKit?

Most applications eventually need to send emails and trigger webhooks — for order confirmations, password resets, event notifications, and more. The operational overhead adds up fast: retries, delivery logs, deduplication, queue management, domain setup.

NotifyKit handles all of that behind a clean API. You make one call; NotifyKit queues it, delivers it, retries on failure, and logs the result.

It's a focused alternative for teams that don't need the full complexity of an enterprise notification platform.

### What NotifyKit Handles

- Background processing and automatic retries
- Idempotent delivery — no accidental double-sends
- Delivery logs with job status tracking
- Domain verification for custom sender addresses
- Per-plan rate limiting and monthly quotas

### What NotifyKit Sends

**Emails** — Send transactional emails via **SendGrid** or **Resend**. On the Free plan, emails go through NotifyKit's shared infrastructure (SendGrid with Resend as automatic fallback). On paid plans, you connect your own API key from either provider (BYOK — bring your own key), giving you full control over deliverability, sender reputation, and sending limits. You can configure both providers simultaneously — NotifyKit delivers through them in priority order and falls back automatically on failure.

**Webhooks** — Deliver HTTP callbacks to any endpoint, with configurable HTTP method, custom headers, and automatic exponential backoff retries on failure.

### Plans

| Plan    | Price     | Monthly Limit     | Emails                            |
| ------- | --------- | ----------------- | --------------------------------- |
| Free    | $0        | 100 notifications | Shared with webhook quota         |
| Indie   | $9/month  | 4,000 webhooks    | Unlimited (via your SendGrid or Resend key) |
| Startup | $30/month | 15,000 webhooks   | Unlimited (via your SendGrid or Resend key) |

On the Free plan, every notification (email or webhook) counts toward a single 100/month limit. On paid plans, emails are unlimited and only webhooks count toward the monthly quota.

### Quick Example

```typescript
import { NotifyKitClient } from "@notifykit/sdk";

const client = new NotifyKitClient({
  apiKey: process.env.NOTIFYKIT_API_KEY!,
});

// Send an email
const emailJob = await client.sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  body: "<h1>Hello World</h1>",
  idempotencyKey: "welcome-user-123",
});

console.log("Email queued:", emailJob.jobId);

// Send a webhook
const webhookJob = await client.sendWebhook({
  url: "https://your-app.com/webhooks/events",
  payload: {
    event: "user.signup",
    userId: "123",
  },
});

console.log("Webhook queued:", webhookJob.jobId);
```

### Next Steps

- [Installation](/docs/getting-started/installation) — Install the SDK
- [Quick Start](/docs/getting-started/quickstart) — Send your first notification
- [API Reference](/docs/api-reference/authentication) — Explore the full API
