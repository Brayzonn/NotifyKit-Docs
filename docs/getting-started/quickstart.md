---
sidebar_position: 2
---

# Quick Start

Send your first notification in under 5 minutes.

### Initialize Client

```typescript
import { NotifyHubClient } from "@notifyhub/sdk";

const client = new NotifyHubClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.notifyhub.com", // optional
});
```

### Send an Email

```typescript
const job = await client.sendEmail({
  to: "user@example.com",
  subject: "Welcome to NotifyHub!",
  body: "<h1>Hello!</h1><p>Welcome to our service.</p>",
});

console.log("Email queued:", job.jobId);
```

### Send a Webhook

```typescript
const job = await client.sendWebhook({
  url: "https://your-app.com/webhook",
  payload: {
    event: "user.signup",
    userId: "123",
    timestamp: Date.now(),
  },
});

console.log("Webhook queued:", job.jobId);
```

### Check Job Status

```typescript
const status = await client.getJob(job.jobId);
console.log(status);
// {
//   id: 'job_123',
//   type: 'email',
//   status: 'completed',
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
import { NotifyHubError } from "@notifyhub/sdk";

try {
  await client.sendEmail({
    to: "invalid-email",
    subject: "Test",
    body: "Hello",
  });
} catch (error) {
  if (error instanceof NotifyHubError) {
    console.error("Status:", error.statusCode);
    console.error("Message:", error.message);

    // Example error response:
    // {
    //   statusCode: 400,
    //   message: "Invalid email format",
    //   error: "Bad Request"
    // }

    if (error.isStatus(400)) {
      console.error("Bad request - check your input");
    } else if (error.isStatus(401)) {
      console.error("Invalid API key");
    } else if (error.isStatus(429)) {
      console.error("Rate limit exceeded");
    }
  }
}
```

### Next Steps

- [API Reference](/docs/api-reference/send-email)
- [SDK Examples](/docs/examples/email-templates)
- [Domain Verification](/docs/guides/domain-verification)
