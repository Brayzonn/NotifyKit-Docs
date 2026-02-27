---
sidebar_position: 2
---

# Quick Start

Send your first notification in under 5 minutes.

### Initialize the Client

```typescript
import { NotifyKitClient } from "@notifykit/sdk";

const client = new NotifyKitClient({
  apiKey: process.env.NOTIFYKIT_API_KEY!, // nh_...
});
```

### Send an Email

```typescript
const job = await client.sendEmail({
  to: "user@example.com",
  subject: "Welcome to NotifyKit!",
  body: "<h1>Hello!</h1><p>Welcome to our service.</p>",
  idempotencyKey: "welcome-user-123", // Prevents duplicate sends
});

console.log("Email queued:", job.jobId);
```

:::info Free vs. paid plan emails
On the **Free plan**, emails send from `noreply@notifykit.dev` via NotifyKit's shared infrastructure.
On **Indie/Startup** plans, connect your own SendGrid API key in **Settings → Email Provider** first.
:::

### Send a Webhook

```typescript
const job = await client.sendWebhook({
  url: "https://your-app.com/webhook",
  payload: {
    event: "user.signup",
    userId: "123",
    timestamp: Date.now(),
  },
  idempotencyKey: "user-123-signup-hook",
});

console.log("Webhook queued:", job.jobId);
```

### Check Job Status

Both `sendEmail` and `sendWebhook` return immediately — delivery is asynchronous. Use the job ID to track status:

```typescript
const status = await client.getJob(job.jobId);

console.log(status);
// {
//   id: 'job_abc123',
//   type: 'email',
//   status: 'completed',     // 'pending' | 'processing' | 'completed' | 'failed'
//   priority: 5,
//   payload: { to: '...', subject: '...', body: '...' },
//   attempts: 1,
//   maxAttempts: 3,
//   errorMessage: null,
//   createdAt: '2026-01-07T12:34:56.789Z',
//   startedAt: '2026-01-07T12:35:01.234Z',
//   completedAt: '2026-01-07T12:35:03.567Z'
// }
```

### Error Handling

```typescript
import { NotifyKitClient, NotifyKitError } from "@notifykit/sdk";

try {
  await client.sendEmail({
    to: "invalid-email",
    subject: "Test",
    body: "Hello",
  });
} catch (error) {
  if (error instanceof NotifyKitError) {
    console.error("Status:", error.statusCode);
    console.error("Message:", error.message);

    if (error.isStatus(400)) {
      console.error("Bad request — check your input");
    } else if (error.isStatus(401)) {
      console.error("Invalid API key");
    } else if (error.isStatus(403)) {
      console.error("Quota exceeded or permission denied:", error.message);
    } else if (error.isStatus(409)) {
      console.error("Duplicate — already sent with this idempotency key");
    } else if (error.isStatus(429)) {
      console.error("Rate limit exceeded");
    }
  }
}
```

### Next Steps

- [API Reference](/docs/api-reference/send-email)
- [TypeScript SDK](/docs/sdk/typescript)
- [Domain Verification](/docs/guides/domain-verification)
- [Retry Logic](/docs/guides/retry-logic)
