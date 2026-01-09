---
sidebar_position: 3
---

# Send Webhook

Send webhook notifications with automatic retries.

### Endpoint

```
POST /api/v1/notifications/webhook
```

### Headers

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| `X-API-Key`    | Your API key       | Yes      |
| `Content-Type` | `application/json` | Yes      |

### Request Body

#### Required Fields

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `url`     | `string` | Webhook endpoint URL |
| `payload` | `object` | JSON payload to send |

#### Optional Fields

| Parameter        | Type           | Description                           |
| ---------------- | -------------- | ------------------------------------- |
| `method`         | `string`       | HTTP method (default: `POST`)         |
| `headers`        | `object`       | Custom headers                        |
| `priority`       | `1 \| 5 \| 10` | Job priority (1=high, 10=low)         |
| `idempotencyKey` | `string`       | Unique key to prevent duplicate sends |

### Examples

#### Basic Webhook

```bash
curl -X POST https://api.notifyhub.com/api/v1/notifications/webhook \
  -H "X-API-Key: ntfy_sk_live_your_key_here" \
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

```bash
curl -X POST https://api.notifyhub.com/api/v1/notifications/webhook \
  -H "X-API-Key: ntfy_sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/webhook",
    "payload": {
      "event": "user.created",
      "userId": "123"
    },
    "headers": {
      "X-Custom-Header": "value",
      "Authorization": "Bearer your_token"
    }
  }'
```

#### PUT Request

```bash
curl -X POST https://api.notifyhub.com/api/v1/notifications/webhook \
  -H "X-API-Key: ntfy_sk_live_your_key_here" \
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
curl -X POST https://api.notifyhub.com/api/v1/notifications/webhook \
  -H "X-API-Key: ntfy_sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/urgent",
    "payload": {
      "alert": "critical"
    },
    "priority": 1
  }'
```

#### Idempotent Request

```bash
curl -X POST https://api.notifyhub.com/api/v1/notifications/webhook \
  -H "X-API-Key: ntfy_sk_live_your_key_here" \
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

NotifyHub automatically retries failed webhooks with exponential backoff:

- **Max attempts:** 3
- **Backoff strategy:** Exponential (2s, 4s, 8s)
- **Success criteria:** 2xx HTTP status codes
- **No retry on:** 4xx client errors (invalid URL, unauthorized, etc.)
- **Retry on:** 5xx server errors, network failures, timeouts

### Request Headers Sent

NotifyHub adds these headers to webhook requests:

```
Content-Type: application/json
User-Agent: NotifyHub/1.0
```

Plus any custom headers you provide.

### Response

#### Success Response

**Status:** `200 OK`

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

Invalid URL or payload:

```json
{
  "success": false,
  "error": "Invalid URL format",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

#### 409 Conflict

Duplicate idempotency key:

```json
{
  "success": false,
  "error": "Duplicate request detected",
  "existingJobId": "job_abc123",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

#### 429 Too Many Requests

Rate limit exceeded:

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

### Checking Webhook Status

After sending a webhook, check its delivery status:

```bash
curl https://api.notifyhub.com/api/v1/notifications/jobs/job_xyz789 \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "job_xyz789",
    "type": "webhook",
    "status": "completed",
    "attempts": 1,
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
- [Retry Configuration](/docs/guides/retry-logic)
