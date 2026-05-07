---
sidebar_position: 2
---

# Retry Logic

NotifyKit automatically retries failed jobs. This page explains how retries work for both emails and webhooks.

## Email Retries

For email jobs, failover and retries are two separate mechanisms:

- **Failover** — when a provider fails, NotifyKit tries the next one in your priority list. This all happens within a single attempt and does not count as a retry.
- **Retries** — only triggered if every provider in your list fails on a given attempt. The job is retried up to 3 times total, then moved to `failed`.

With forced routing (`provider`/`fallback` fields set), there are no automatic retries — if both the specified provider and fallback fail, the job is permanently failed immediately.

## Webhook Automatic Retries

When a webhook delivery fails, NotifyKit re-queues it with exponential backoff:

| Attempt | Delay before retry |
| ------- | ------------------ |
| 1st     | Immediate          |
| 2nd     | ~2 minutes         |
| 3rd     | ~4 minutes         |

After 3 failed attempts, the job moves to `failed` status and retries stop.

## When NotifyKit Retries

| Condition                               | Retried?     |
| --------------------------------------- | ------------ |
| 5xx response from your endpoint         | Yes          |
| Network error or connection refused     | Yes          |
| Request timeout                         | Yes          |
| 4xx response (400, 401, 403, 404, etc.) | No           |
| 2xx response                            | No (success) |

:::info 4xx errors are not retried
A 4xx response means your endpoint rejected the request. Retrying the same payload to the same endpoint would produce the same result. Fix the endpoint configuration or payload instead.
:::

## Checking Job Status After Delivery

After sending a webhook, poll the job endpoint to confirm delivery:

```typescript
const job = await client.sendWebhook({
  url: "https://your-app.com/webhook",
  payload: { event: "order.placed", orderId: "123" },
  idempotencyKey: "order-123-webhook",
});

// Check status after a short delay
setTimeout(async () => {
  const status = await client.getJob(job.jobId);

  switch (status.status) {
    case "completed":
      console.log(`Delivered after ${status.attempts} attempt(s)`);
      break;
    case "failed":
      console.error(
        `Failed after ${status.attempts} attempt(s): ${status.errorMessage}`,
      );
      break;
    case "processing":
      console.log("Still in progress...");
      break;
    case "pending":
      console.log("Waiting in queue...");
      break;
  }
}, 5000);
```

## Listing Failed Jobs

To audit all failed deliveries:

```typescript
const { data, pagination } = await client.listJobs({
  status: "failed",
  type: "webhook",
  limit: 50,
});

data.forEach((job) => {
  console.log(`Job ${job.id} failed: ${job.errorMessage}`);
  console.log(`Attempted ${job.attempts} time(s), last at ${job.completedAt}`);
});
```

Or via the REST API:

```bash
curl "https://api.notifykit.dev/api/v1/notifications/jobs?status=failed&type=webhook" \
  -H "X-API-Key: nh_your_key_here"
```

## Manual Retry

You can manually re-queue any job with `failed` status:

```typescript
try {
  const result = await client.retryJob("job_xyz789");
  console.log(result.message); // "Job has been re-queued for processing"
  console.log(result.status); // "pending"
} catch (error) {
  if (error instanceof NotifyKitError && error.isStatus(404)) {
    console.error("Job not found or not in failed status");
  }
}
```

REST API:

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/jobs/job_xyz789/retry \
  -H "X-API-Key: nh_your_key_here"
```

Only jobs with `failed` status can be retried. Jobs in `pending`, `processing`, or `completed` status cannot.

## Preventing Duplicate Delivery

Use `idempotencyKey` to ensure a notification is only sent once, even if your code retries the send request due to a network error:

```typescript
await client.sendWebhook({
  url: "https://your-app.com/webhook",
  payload: { orderId: "order_123" },
  idempotencyKey: "order-123-fulfillment-webhook", // Unique per logical event
});
```

If you call `sendWebhook` again with the same `idempotencyKey`, the API returns `409 Conflict` and does not create a new job. The first job (and its delivery) are not affected.

**Good idempotency key patterns:**

```
order-{orderId}-confirmation
user-{userId}-welcome-email
payment-{paymentId}-receipt
invoice-{invoiceId}-reminder
```


## Handling API Rate Limits

If you exceed the rate limit, the API returns `429 Too Many Requests`:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "timestamp": "2026-03-03T12:00:00.000Z"
}
```

The response does not include a `retryAfter` field or `Retry-After` header. The rate limit window is 1 minute — wait before retrying.

### With the SDK

```typescript
import { NotifyKitError } from '@notifykit/sdk';

try {
  await client.sendEmail({ to: '...', subject: '...', body: '...' });
} catch (error) {
  if (error instanceof NotifyKitError && error.isStatus(429)) {
    console.log('Rate limited — retry after 60 seconds');
    await new Promise((resolve) => setTimeout(resolve, 60_000));
    // retry...
  }
}
```

:::info Plan limits
Rate limits on notification endpoints are per-plan. If you consistently hit limits, consider upgrading your plan. See [Authentication](/docs/api-reference/authentication) for the full rate limit table.
:::

## Next Steps

- [Webhook Security](/docs/guides/webhook-security)
- [Send Webhook](/docs/api-reference/send-webhook)
- [Jobs API](/docs/api-reference/jobs)
