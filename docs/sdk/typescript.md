---
sidebar_position: 1
---

# TypeScript SDK

Complete reference for the `@notifykit/sdk` TypeScript/Node.js client.

### Installation

```bash
npm install @notifykit/sdk
# yarn add @notifykit/sdk
# pnpm add @notifykit/sdk
```

**Requirements:** Node.js 18+, TypeScript 5.0+ (optional but recommended)

### Initialization

```typescript
import { NotifyKitClient } from "@notifykit/sdk";

const client = new NotifyKitClient({
  apiKey: process.env.NOTIFYKIT_API_KEY!,
  baseUrl: "https://api.notifykit.dev", // Optional — defaults to production
});
```

### Configuration Options

| Option    | Type     | Required | Description                                           |
| --------- | -------- | -------- | ----------------------------------------------------- |
| `apiKey`  | `string` | Yes      | Your NotifyKit API key (`nh_...`)                     |
| `baseUrl` | `string` | No       | API base URL. Defaults to `https://api.notifykit.dev` |

---

## Methods

### `sendEmail(options)`

Queue an email for delivery. Returns immediately with a job ID — the email is sent asynchronously.

**Parameters:**

```typescript
type EmailProvider = "SENDGRID" | "RESEND" | "POSTMARK";

interface SendEmailOptions {
  to: string; // Recipient email address
  subject: string; // Email subject line
  body: string; // Email body (HTML supported)
  from?: string; // Sender address. Use your verified domain (e.g. support@yourdomain.com). Paid plans only.
  priority?: 1 | 5 | 10; // Job priority: 1=high, 5=normal (default), 10=low
  idempotencyKey?: string; // Unique key to prevent duplicate sends
  provider?: EmailProvider; // Force this email through a specific provider. Paid plans only.
  fallback?: EmailProvider; // Second provider tried only if `provider` fails. Requires `provider`.
}
```

**Returns:** `Promise<JobResponse>`

```typescript
interface JobResponse {
  jobId: string;
  status: string; // "pending" on creation
  type: string; // "email"
  createdAt: string; // ISO 8601 timestamp
}
```

**Example:**

```typescript
const job = await client.sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  body: "<h1>Hello World</h1>",
  priority: 1, // High priority
  idempotencyKey: "welcome-user-123", // Prevents duplicate sends
});

console.log(job.jobId); // "job_abc123"
```

:::info Email providers by plan

- **Free:** Sent via NotifyKit's shared infrastructure (SendGrid, Resend, and Postmark with automatic failover). `from` is always `noreply@notifykit.dev`.
- **Indie / Startup:** Sent via your own provider keys. Connect SendGrid, Resend, and/or Postmark in **Settings → API Keys**. Custom `from` addresses (using your verified domain) are supported.
  :::

:::note Per-message provider routing
Paid plans can force a single email through a specific provider by passing `provider` (and optionally `fallback`) on `sendEmail()`. Available since SDK **1.1.0**. See [Per-Message Provider Routing](/docs/api-reference/send-email#per-message-provider-routing-paid-plans).

```typescript
await client.sendEmail({
  to: "user@example.com",
  subject: "Receipt",
  body: "<h1>Thanks</h1>",
  provider: "SENDGRID",
  fallback: "RESEND", // optional; requires provider
});
```
:::

---

### `sendWebhook(options)`

Queue a webhook delivery. Returns immediately with a job ID.

**Parameters:**

```typescript
interface SendWebhookOptions {
  url: string; // Webhook destination URL (must be HTTPS)
  payload: object; // JSON payload to deliver (required)
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; // HTTP method (default: "POST")
  headers?: Record<string, string>; // Custom headers to include
  priority?: 1 | 5 | 10; // Job priority: 1=high, 5=normal (default), 10=low
  idempotencyKey?: string; // Unique key to prevent duplicate sends
}
```

**Returns:** `Promise<JobResponse>`

**Example:**

```typescript
const job = await client.sendWebhook({
  url: "https://api.example.com/webhook",
  payload: {
    event: "payment.completed",
    amount: 49.99,
  },
  headers: {
    "X-Webhook-Secret": process.env.WEBHOOK_SECRET!,
  },
  idempotencyKey: "payment-456-webhook",
});

console.log(job.jobId); // "job_xyz789"
```

---

### `getJob(jobId)`

Get the full status and details of a specific job.

**Parameters:**

- `jobId` (`string`) — The job ID returned from `sendEmail` or `sendWebhook`

**Returns:** `Promise<JobStatus>`

```typescript
interface JobStatus {
  id: string;
  type: string; // "email" or "webhook"
  status: "pending" | "processing" | "completed" | "failed";
  priority: number;
  payload: object; // The original payload sent
  attempts: number; // Number of delivery attempts made
  maxAttempts: number; // Maximum attempts (3)
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  deliveryLogs: DeliveryLog[]; // Per-attempt delivery records (email jobs)
}

interface DeliveryLog {
  id: string;
  attempt: number;
  status: string;
  // Success rows: provider that delivered. Failure rows: last attempted.
  // `null` for pre-attempt failures or webhook jobs.
  usedProvider: EmailProvider | null;
  errorMessage: string | null;
  createdAt: string;
}
```

**Example:**

```typescript
const status = await client.getJob("job_abc123");

console.log(status.status); // "completed"
console.log(status.attempts); // 1

if (status.status === "failed") {
  console.error("Delivery failed:", status.errorMessage);
}

// Inspect per-attempt provider history (email jobs)
for (const log of status.deliveryLogs) {
  console.log(`attempt ${log.attempt} via ${log.usedProvider ?? "unknown"}: ${log.status}`);
}
```

:::note `deliveryLogs` was added in SDK **1.1.0**
Webhook jobs return an empty array. For email jobs, the last entry's `usedProvider` is the provider that delivered (success) or the last one attempted (failure).
:::

---

### `listJobs(options?)`

List your jobs with optional filters and pagination.

**Parameters:**

```typescript
interface ListJobsOptions {
  page?: number; // Page number (default: 1)
  limit?: number; // Per page (default: 20, max: 100)
  type?: "email" | "webhook"; // Filter by notification type
  status?: "pending" | "processing" | "completed" | "failed"; // Filter by status
}
```

**Returns:** `Promise<{ data: JobSummary[]; pagination: PaginationMeta }>`

```typescript
interface JobSummary {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  priority: number;
  attempts: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

**Example:**

```typescript
const { data, pagination } = await client.listJobs({
  status: "failed",
  type: "webhook",
  limit: 10,
});

console.log(`${pagination.total} failed webhook jobs`);

data.forEach((job) => {
  console.log(`${job.id}: ${job.errorMessage} (${job.attempts} attempts)`);
});
```

---

### `retryJob(jobId)`

Re-queue a failed job for another delivery attempt.

**Parameters:**

- `jobId` (`string`) — ID of the job with `failed` status

**Returns:** `Promise<RetryJobResponse>`

```typescript
interface RetryJobResponse {
  jobId: string;
  status: string; // "pending"
  message: string;
}
```

**Example:**

```typescript
const result = await client.retryJob("job_xyz789");
console.log(result.message); // "Job has been re-queued for processing"
console.log(result.status); // "pending"
```

:::info Retry eligibility
Only jobs with `failed` status can be retried. `pending`, `processing`, and `completed` jobs cannot be retried.
:::

---

### `ping()`

Test API connectivity.

**Returns:** `Promise<string>`

**Example:**

```typescript
const pong = await client.ping();
console.log(pong); // "pong"
```

---

### `getApiInfo()`

Get API version and metadata.

**Returns:** `Promise<ApiInfo>`

```typescript
interface ApiInfo {
  name: string;
  version: string;
  description: string;
  documentation: string;
}
```

**Example:**

```typescript
const info = await client.getApiInfo();
console.log(info.name); // "NotifyKit API"
console.log(info.version); // "1.0.0"
```

---

## Error Handling

All API errors throw a `NotifyKitError`.

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
    // Formatted message with status code
    console.error(error.getFullMessage());

    // Check specific codes
    if (error.isStatus(400)) {
      console.error("Bad request:", error.message);
    } else if (error.isStatus(401)) {
      console.error("Invalid API key");
    } else if (error.isStatus(403)) {
      // Could be: domain not verified, quota exceeded, account inactive
      console.error("Forbidden:", error.message);
    } else if (error.isStatus(409)) {
      console.error("Duplicate idempotency key");
    } else if (error.isStatus(429)) {
      console.error("Rate limit exceeded");
    }

    // Raw details
    console.error("Status code:", error.statusCode);
    console.error("Validation errors:", error.errors); // Array, if any
  }
}
```

### NotifyKitError Properties

| Property     | Type       | Description                                |
| ------------ | ---------- | ------------------------------------------ |
| `message`    | `string`   | Error message from the API                 |
| `statusCode` | `number`   | HTTP status code                           |
| `response`   | `any`      | Full raw API response                      |
| `errors`     | `string[]` | Validation error details (400 errors only) |

### NotifyKitError Methods

| Method             | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `isStatus(code)`   | Returns `true` if `statusCode === code`                |
| `getFullMessage()` | Returns `[statusCode] message\nValidation errors: ...` |

---

## TypeScript Types

All types are exported from the package:

```typescript
import type {
  NotifyKitConfig,
  SendEmailOptions,
  SendWebhookOptions,
  JobResponse,
  JobStatus,
  JobSummary,
  DeliveryLog,
  EmailProvider,
  RetryJobResponse,
  PaginationMeta,
  ApiInfo,
} from "@notifykit/sdk";
```

:::note Domain verification
Domain verification is **dashboard-only** (**Settings → Domain**). The SDK does not export domain types or methods.
:::

---

## Complete Example

```typescript
import { NotifyKitClient, NotifyKitError } from "@notifykit/sdk";

const client = new NotifyKitClient({
  apiKey: process.env.NOTIFYKIT_API_KEY!,
});

async function notifyUserAndSystem(
  userId: string,
  userEmail: string,
  orderId: string,
) {
  try {
    // Send welcome email
    const emailJob = await client.sendEmail({
      to: userEmail,
      subject: `Order #${orderId} Confirmed`,
      body: `<h1>Thanks for your order!</h1><p>Order ID: ${orderId}</p>`,
      priority: 1,
      idempotencyKey: `order-${orderId}-email`,
    });

    console.log(`Email queued: ${emailJob.jobId}`);

    // Notify internal system via webhook
    const webhookJob = await client.sendWebhook({
      url: "https://internal.your-app.com/order-events",
      payload: { event: "order.confirmed", orderId, userId },
      headers: { "X-Internal-Secret": process.env.INTERNAL_WEBHOOK_SECRET! },
      idempotencyKey: `order-${orderId}-webhook`,
    });

    console.log(`Webhook queued: ${webhookJob.jobId}`);

    // Check email delivery after 10 seconds
    setTimeout(async () => {
      const status = await client.getJob(emailJob.jobId);
      if (status.status === "failed") {
        console.error(`Email delivery failed: ${status.errorMessage}`);
        // Optionally retry
        await client.retryJob(emailJob.jobId);
      }
    }, 10_000);
  } catch (error) {
    if (error instanceof NotifyKitError) {
      if (error.isStatus(409)) {
        console.log("Already notified — idempotency key matched");
      } else if (error.isStatus(403)) {
        console.error("Quota or permission error:", error.message);
      } else {
        console.error("Notification failed:", error.getFullMessage());
      }
    }
    throw error;
  }
}
```

### Next Steps

- [Domain Verification Guide](/docs/guides/domain-verification)
- [Retry Logic](/docs/guides/retry-logic)
- [Webhook Security](/docs/guides/webhook-security)
