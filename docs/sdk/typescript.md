---
sidebar_position: 1
---

# TypeScript SDK

Complete reference for the NotifyHub TypeScript SDK.

### Installation

```bash
npm install @notifyhub/sdk
```

### Initialization

```typescript
import { NotifyHubClient } from "@notifyhub/sdk";

const client = new NotifyHubClient({
  apiKey: process.env.NOTIFYHUB_API_KEY,
  baseUrl: "https://api.notifyhub.com", // Optional
});
```

### Configuration Options

| Option    | Type     | Required | Description                     |
| --------- | -------- | -------- | ------------------------------- |
| `apiKey`  | `string` | Yes      | Your NotifyHub API key          |
| `baseUrl` | `string` | No       | API base URL (defaults to prod) |

### Methods

#### `sendEmail(options)`

Send an email notification.

**Parameters:**

```typescript
interface SendEmailOptions {
  to: string; // Recipient email address
  subject: string; // Email subject line
  body: string; // Email body (HTML supported)
  from?: string; // Sender email (requires verified domain)
  idempotencyKey?: string; // Unique key to prevent duplicates
}
```

**Returns:** `Promise<JobResponse>`

```typescript
{
  jobId: string;
  status: string;
  type: string;
  createdAt: string;
}
```

**Example:**

```typescript
const job = await client.sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  body: "<h1>Hello World</h1>",
  idempotencyKey: "welcome-user-123", // Optional
});

console.log(job.jobId); // "job_abc123"
```

#### `sendWebhook(options)`

Send a webhook notification with automatic retries.

**Parameters:**

```typescript
interface SendWebhookOptions {
  url: string; // Webhook endpoint URL
  payload?: any; // JSON payload to send
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; // HTTP method (default: POST)
  headers?: Record<string, string>; // Custom headers
  idempotencyKey?: string; // Unique key to prevent duplicates
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
  method: "POST",
  headers: {
    Authorization: "Bearer token",
  },
});
```

#### `getJob(jobId)`

Get the status and details of a specific job.

**Parameters:**

- `jobId` (string): The job ID

**Returns:** `Promise<JobStatus>`

```typescript
interface JobStatus {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}
```

**Example:**

```typescript
const status = await client.getJob("job_abc123");

console.log(status.status); // "completed"
console.log(status.attempts); // 1
```

#### `listJobs(options?)`

List jobs with optional filters and pagination.

**Parameters:**

```typescript
interface ListJobsOptions {
  page?: number; // Page number (default: 1)
  limit?: number; // Jobs per page (default: 20, max: 100)
  type?: "email" | "webhook"; // Filter by job type
  status?: "pending" | "processing" | "completed" | "failed"; // Filter by status
}
```

**Returns:** `Promise<{ data: JobStatus[]; pagination: any }>`

**Example:**

```typescript
const { data, pagination } = await client.listJobs({
  page: 1,
  limit: 10,
  type: "email",
  status: "completed",
});

console.log(pagination.total); // 150
console.log(pagination.totalPages); // 15
console.log(data.length); // 10
```

#### `retryJob(jobId)`

Retry a failed job. Only jobs with `failed` status can be retried.

**Parameters:**

- `jobId` (string): The ID of the failed job

**Returns:** `Promise<JobResponse>`

**Example:**

```typescript
try {
  const job = await client.retryJob("job_xyz789");
  console.log(job.status); // "pending"
} catch (error) {
  // Job not found or not in failed status
}
```

#### `ping()`

Test API connection.

**Returns:** `Promise<string>`

**Example:**

```typescript
const pong = await client.ping();
console.log(pong); // "pong"
```

#### `getApiInfo()`

Get API information and version.

**Returns:** `Promise<ApiInfo>`

**Example:**

```typescript
const info = await client.getApiInfo();
console.log(info.name); // "NotifyHub API"
console.log(info.version); // "1.0.0"
```

### Domain Verification

#### `requestDomainVerification(domain)`

Request verification for a custom sender domain.

**Parameters:**

- `domain` (string): The domain to verify (e.g., "yourdomain.com")

**Returns:** `Promise<DomainVerificationResponse>`

```typescript
interface DomainVerificationResponse {
  domain: string;
  status: "pending" | "verified";
  dnsRecords: DnsRecord[];
  instructions: {
    message: string;
    steps: string[];
    estimatedTime: string;
  };
}

interface DnsRecord {
  type: string;
  host: string;
  data: string;
  valid: boolean;
}
```

**Example:**

```typescript
const result = await client.requestDomainVerification("yourdomain.com");

console.log(result.dnsRecords);
// [
//   { type: "TXT", host: "_dmarc", value: "v=DMARC1; p=none;" },
//   { type: "CNAME", host: "em123", value: "u123.wl.sendgrid.net" }
// ]
```

#### `verifyDomain()`

Check domain verification status.

**Returns:** `Promise<DomainStatusResponse>`

```typescript
interface DomainStatusResponse {
  domain: string;
  verified: boolean;
  message: string;
  validationResults?: any;
}
```

**Example:**

```typescript
const status = await client.verifyDomain();

if (status.verified) {
  console.log("Domain verified!");
} else {
  console.log(status.message);
}
```

#### `getDomainStatus()`

Get current domain configuration status.

**Returns:** `Promise<DomainInfoResponse>`

```typescript
interface DomainInfoResponse {
  domain: string | null;
  verified: boolean;
  status: "not_configured" | "pending" | "verified";
  dnsRecords?: any;
  requestedAt?: string;
  verifiedAt?: string;
}
```

**Example:**

```typescript
const info = await client.getDomainStatus();

if (info.status === "not_configured") {
  console.log("No domain configured");
} else if (info.status === "pending") {
  console.log("Waiting for DNS propagation");
}
```

#### `removeDomain()`

Remove domain configuration.

**Returns:** `Promise<string>` (success message)

**Example:**

```typescript
const message = await client.removeDomain();
console.log(message); // "Domain removed successfully"
```

### Error Handling

The SDK throws `NotifyHubError` for API errors with helpful methods.

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
    // Get formatted error message
    console.error(error.getFullMessage());

    // Check specific status codes
    if (error.isStatus(400)) {
      console.error("Invalid request:", error.message);
    } else if (error.isStatus(403)) {
      console.error("Domain not verified");
    } else if (error.isStatus(409)) {
      console.error("Duplicate idempotency key");
    } else if (error.isStatus(429)) {
      console.error("Rate limit exceeded");
    }

    // Access error details
    console.error("Status:", error.statusCode);
    console.error("Errors:", error.errors); // Validation errors array
  }
}
```

#### NotifyHubError Methods

| Method             | Description                          |
| ------------------ | ------------------------------------ |
| `isStatus(code)`   | Check if error matches a status code |
| `getFullMessage()` | Get formatted error with all details |

#### NotifyHubError Properties

| Property     | Type       | Description                |
| ------------ | ---------- | -------------------------- |
| `message`    | `string`   | Error message              |
| `statusCode` | `number`   | HTTP status code           |
| `response`   | `any`      | Full API response          |
| `errors`     | `string[]` | Validation errors (if any) |

### TypeScript Types

Import types for better type safety:

```typescript
import type {
  NotifyHubConfig,
  SendEmailOptions,
  SendWebhookOptions,
  JobResponse,
  JobStatus,
  DomainVerificationResponse,
  DomainStatusResponse,
  DomainInfoResponse,
  DomainVerificationRequest,
  DnsRecord,
  ApiInfo,
} from "@notifyhub/sdk";
```

### Complete Example

```typescript
import { NotifyHubClient, NotifyHubError } from "@notifyhub/sdk";

const client = new NotifyHubClient({
  apiKey: process.env.NOTIFYHUB_API_KEY!,
});

async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    // Send email
    const job = await client.sendEmail({
      to: userEmail,
      subject: `Welcome ${userName}!`,
      body: `<h1>Hello ${userName}</h1><p>Thanks for signing up!</p>`,
      idempotencyKey: `welcome-${userEmail}`,
    });

    console.log(`Email queued: ${job.jobId}`);

    // Check status
    const status = await client.getJob(job.jobId);
    console.log(`Status: ${status.status}`);

    return job;
  } catch (error) {
    if (error instanceof NotifyHubError) {
      if (error.isStatus(409)) {
        console.log("Email already sent to this user");
      } else {
        console.error("Failed to send email:", error.getFullMessage());
      }
    }
    throw error;
  }
}
```

### Next Steps

- [Domain Verification Guide](/docs/guides/domain-verification)
