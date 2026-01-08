---
sidebar_position: 1
---

# TypeScript SDK

Complete reference for the NotifyHub TypeScript SDK.

## Installation

```bash
npm install @notifyhub/sdk
```

## Initialization

```typescript
import { NotifyHubClient } from "@notifyhub/sdk";

const client = new NotifyHubClient({
  apiKey: process.env.NOTIFYHUB_API_KEY,
  baseUrl: "https://api.notifyhub.com",
});
```

## Methods

### `ping()`

Test API connection.

```typescript
const pong = await client.ping();
// { success: true, message: 'pong', timestamp: '...' }
```

### `sendEmail(options)`

Send an email notification.

```typescript
const job = await client.sendEmail({
  to: "user@example.com",
  subject: "Hello",
  body: "<h1>World</h1>",
});
```

### `sendWebhook(options)`

Send a webhook notification.

```typescript
const job = await client.sendWebhook({
  url: "https://example.com/webhook",
  payload: { event: "test" },
});
```

### `getJob(jobId)`

Get job status by ID.

```typescript
const status = await client.getJob("job_123");
```

### `listJobs(options?)`

List jobs with filters.

```typescript
const { data, pagination } = await client.listJobs({
  limit: 10,
  type: "email",
  status: "completed",
});
```

### `retryJob(jobId)`

Retry a failed job.

```typescript
const job = await client.retryJob("job_123");
```

### Domain Management

```typescript
// Request domain verification
const result = await client.requestDomainVerification("yourdomain.com");

// Check verification status
const status = await client.verifyDomain();

// Get domain status
const info = await client.getDomainStatus();

// Remove domain
await client.removeDomain();
```

## Error Handling

```typescript
import { NotifyHubError } from '@notifyhub/sdk';

try {
  await client.sendEmail({ ... });
} catch (error) {
  if (error instanceof NotifyHubError) {
    console.error(error.getFullMessage());

    if (error.isStatus(400)) {
      // Handle bad request
    }
  }
}
```

## TypeScript Types

```typescript
import type {
  SendEmailOptions,
  SendWebhookOptions,
  JobResponse,
  JobStatus,
} from "@notifyhub/sdk";
```

## Next Steps

- [Examples](/docs/examples/email-templates)
- [API Reference](/docs/api-reference/authentication)
