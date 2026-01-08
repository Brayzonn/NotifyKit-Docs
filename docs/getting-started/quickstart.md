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
//   attempts: 1
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

    if (error.isStatus(400)) {
      console.error("Bad request - check your input");
    }
  }
}
```

### Next Steps

- [API Reference](/docs/api-reference/send-email)
- [SDK Examples](/docs/examples/email-templates)
- [Domain Verification](/docs/guides/domain-verification)
