---
sidebar_position: 3
---

# Send Webhook

Queue a webhook notification for delivery with automatic retries.

### Endpoint

```
POST /api/v1/notifications/webhook
```

### Headers

| Header                    | Value              | Required           |
| ------------------------- | ------------------ | ------------------ |
| `X-API-Key`               | Your API key       | Yes (or Bearer)    |
| `Authorization: Bearer`   | Your API key       | Yes (or X-API-Key) |
| `Content-Type`            | `application/json` | Yes                |

### Request Body

#### Required Fields

| Parameter | Type     | Description                                      |
| --------- | -------- | ------------------------------------------------ |
| `url`     | `string` | Webhook endpoint URL (must be a valid HTTPS URL) |
| `payload` | `object` | JSON payload to send                             |

#### Optional Fields

| Parameter        | Type           | Description                                           |
| ---------------- | -------------- | ----------------------------------------------------- |
| `method`         | `string`       | HTTP method (default: `POST`)                         |
| `headers`        | `object`       | Custom headers to include in the request              |
| `priority`       | `1 \| 5 \| 10` | Job priority (1=high, 5=normal, 10=low). Default: `5` |
| `idempotencyKey` | `string`       | Unique key to prevent duplicate sends                 |

### Examples

#### Basic Webhook

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/webhook \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/notifications",
    "payload": {
      "type": "payment.completed",
      "amount": 49.99,
      "currency": "USD"
    }
  }'
```

#### Custom Headers

Use custom headers to authenticate the request at the receiving endpoint:

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/webhook \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/webhook",
    "payload": {
      "event": "user.created",
      "userId": "123"
    },
    "headers": {
      "X-Webhook-Secret": "your_shared_secret",
      "X-Event-Type": "user.created"
    }
  }'
```

#### PUT Request

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/webhook \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/resource/123",
    "method": "PUT",
    "payload": {
      "status": "completed"
    }
  }'
```

#### High Priority Webhook

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/webhook \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/urgent",
    "payload": {
      "alert": "critical",
      "threshold": "exceeded"
    },
    "priority": 1
  }'
```

#### Idempotent Request

Use an `idempotencyKey` to prevent duplicate jobs if the same request is sent more than once
(e.g., your client retries after a network timeout). If a job with the same key already exists,
the API returns `409 Conflict` and no new job is created.

To retry a **failed** job, use the [Retry Job](/docs/api-reference/jobs) endpoint instead —
idempotency keys do not apply there.

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/webhook \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/webhook",
    "payload": {
      "orderId": "order_123"
    },
    "idempotencyKey": "order-123-webhook"
  }'
```

### Retry Logic

NotifyKit automatically retries failed webhook deliveries:

- **Max attempts:** 3
- **Backoff strategy:** Exponential (2 min → 4 min between retries)
- **Success criteria:** Any 2xx HTTP response from your endpoint
- **Retried on:** 5xx server errors, network failures, connection timeouts
- **Not retried on:** 4xx client errors (invalid URL, unauthorized, etc.)

See [Retry Logic](/docs/guides/retry-logic) for details.

### Request Headers Sent to Your Endpoint

NotifyKit adds these headers to every webhook delivery:

```
Content-Type: application/json
User-Agent: NotifyKit/1.0
```

Any custom `headers` you include are added on top of these.

### Response

Webhooks are queued immediately and delivered asynchronously. Check the job status to confirm delivery.

**Status:** `202 Accepted`

```json
{
  "success": true,
  "data": {
    "jobId": "job_xyz789",
    "status": "pending",
    "type": "webhook",
    "createdAt": "2026-01-09T12:34:56.789Z"
  },
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

### Error Responses

#### 400 Bad Request

Invalid URL or missing required field:

```json
{
  "success": false,
  "error": "url must be a valid HTTPS URL",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

#### 403 Forbidden

Monthly quota exceeded:

```json
{
  "success": false,
  "error": "Monthly usage limit exceeded (4000/4000). Upgrade your plan or wait for reset on 2/1/2026.",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

#### 409 Conflict

Duplicate `idempotencyKey` — webhook was already queued:

```json
{
  "success": false,
  "error": "Duplicate request detected",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

#### 429 Too Many Requests

API rate limit exceeded:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

### Checking Delivery Status

After sending a webhook, poll the job endpoint to confirm delivery:

```bash
curl https://api.notifykit.dev/api/v1/notifications/jobs/job_xyz789 \
  -H "X-API-Key: nh_your_key_here"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "job_xyz789",
    "type": "webhook",
    "status": "completed",
    "priority": 5,
    "attempts": 1,
    "maxAttempts": 3,
    "errorMessage": null,
    "createdAt": "2026-01-09T12:34:56.789Z",
    "startedAt": "2026-01-09T12:34:57.123Z",
    "completedAt": "2026-01-09T12:34:58.456Z"
  },
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

### Next Steps

- [Check Job Status](/docs/api-reference/jobs)
- [Webhook Security](/docs/guides/webhook-security)
- [Retry Logic](/docs/guides/retry-logic)
