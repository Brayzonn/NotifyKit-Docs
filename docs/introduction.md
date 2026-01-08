---
sidebar_position: 1
---

# Introduction

Welcome to NotifyHub - a simple, affordable notification infrastructure for developers.

### What is NotifyHub?

NotifyHub offers production-ready notification infrastructure while removing the operational overhead from your application.

Most teams start with an email provider and a background queue. Over time, that grows into retries, deduplication, delivery logs, dead-letter queues, domain setup, and on-call maintenance.

NotifyHub handles these concerns behind a simple, type-safe API, so notifications don't become a system you have to manage.

It's a focused, affordable alternative for developers who find full-featured platforms to be overkill for their use case.

### What NotifyHub Does for You

NotifyHub takes ownership of the hard parts of notification delivery:

- Reliable background processing and retries
- Safe, idempotent delivery (no accidental double sends)
- Auditable delivery logs
- Domain verification and email best practices
- Predictable, simple pricing

You make an API call. NotifyHub handles the rest.

### Key Features

**Email Delivery** — Send emails via SendGrid with custom domain support

**Webhook Notifications** — Reliable webhook delivery with automatic retries

**Queue Management** — Built on Bull/BullMQ with Redis for reliability

**Domain Verification** — Verify custom domains for professional email sending

**TypeScript SDK** — Type-safe client library with full IntelliSense

**Developer-Friendly** — Clean API with extensive documentation

### Quick Example

```typescript
import { NotifyHubClient } from "@notifyhub/sdk";

const client = new NotifyHubClient({
  apiKey: "your-api-key",
});

await client.sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  body: "<h1>Hello World</h1>",
});
```

### Next Steps

- [Installation](/docs/getting-started/installation) - Install the SDK
- [Quick Start](/docs/getting-started/quickstart) - Send your first notification
- [API Reference](/docs/api-reference/authentication) - Explore the API
