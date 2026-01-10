---
sidebar_position: 4
---

# Jobs

Manage and monitor notification jobs.

## Get Job Status

Retrieve the status and details of a specific job.

### Endpoint

```
GET /api/v1/notifications/jobs/{jobId}
```

### Headers

| Header      | Value        | Required |
| ----------- | ------------ | -------- |
| `X-API-Key` | Your API key | Yes      |

### Path Parameters

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| `jobId`   | `string` | Job ID      |

### Example

```bash
curl https://api.notifyhub.com/api/v1/notifications/jobs/job_abc123 \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "job_abc123",
    "type": "email",
    "status": "completed",
    "priority": 5,
    "attempts": 1,
    "maxAttempts": 3,
    "createdAt": "2026-01-09T12:34:56.789Z",
    "startedAt": "2026-01-09T12:34:57.123Z",
    "completedAt": "2026-01-09T12:34:58.456Z",
    "payload": {
      "to": "user@example.com",
      "subject": "Welcome!",
      "body": "<h1>Hello</h1>"
    }
  },
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

### Job Status Values

| Status       | Description                         |
| ------------ | ----------------------------------- |
| `pending`    | Job queued, waiting to be processed |
| `processing` | Job currently being processed       |
| `completed`  | Job completed successfully          |
| `failed`     | Job failed after all retry attempts |

### Error Response

**Status:** `404 Not Found`

```json
{
  "success": false,
  "error": "Job not found",
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

## List Jobs

Retrieve a paginated list of jobs with optional filters.

### Endpoint

```
GET /api/v1/notifications/jobs
```

### Headers

| Header      | Value        | Required |
| ----------- | ------------ | -------- |
| `X-API-Key` | Your API key | Yes      |

### Query Parameters

| Parameter | Type     | Description                                                         | Default |
| --------- | -------- | ------------------------------------------------------------------- | ------- |
| `page`    | `number` | Page number                                                         | `1`     |
| `limit`   | `number` | Jobs per page (max: 100)                                            | `20`    |
| `type`    | `string` | Filter by job type: `email` or `webhook`                            | -       |
| `status`  | `string` | Filter by status: `pending`, `processing`, `completed`, or `failed` | -       |

### Examples

#### List All Jobs

```bash
curl https://api.notifyhub.com/api/v1/notifications/jobs \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

#### Filter by Type

```bash
curl "https://api.notifyhub.com/api/v1/notifications/jobs?type=email" \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

#### Filter by Status

```bash
curl "https://api.notifyhub.com/api/v1/notifications/jobs?status=failed" \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

#### Pagination

```bash
curl "https://api.notifyhub.com/api/v1/notifications/jobs?page=2&limit=50" \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

#### Combined Filters

```bash
curl "https://api.notifyhub.com/api/v1/notifications/jobs?type=webhook&status=completed&page=1&limit=10" \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "job_abc123",
        "type": "email",
        "status": "completed",
        "attempts": 1,
        "createdAt": "2026-01-09T12:34:56.789Z",
        "completedAt": "2026-01-09T12:34:58.456Z"
      },
      {
        "id": "job_xyz789",
        "type": "webhook",
        "status": "failed",
        "attempts": 3,
        "errorMessage": "Connection timeout",
        "createdAt": "2026-01-09T12:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

## Retry Failed Job

Retry a failed job. Only jobs with `failed` status can be retried.

### Endpoint

```
POST /api/v1/notifications/jobs/{jobId}/retry
```

### Headers

| Header      | Value        | Required |
| ----------- | ------------ | -------- |
| `X-API-Key` | Your API key | Yes      |

### Path Parameters

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `jobId`   | `string` | ID of failed job |

### Example

```bash
curl -X POST https://api.notifyhub.com/api/v1/notifications/jobs/job_xyz789/retry \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "jobId": "job_xyz789",
    "status": "pending",
    "type": "webhook",
    "createdAt": "2026-01-09T12:35:00.000Z"
  },
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

### Error Responses

#### 404 Not Found

Job doesn't exist or cannot be retried:

```json
{
  "success": false,
  "error": "Job not found or cannot be retried (must be in failed status)",
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

:::info Retry Limitations
Only jobs with `failed` status can be retried. Jobs that are `pending`, `processing`, or `completed` cannot be retried.
:::
