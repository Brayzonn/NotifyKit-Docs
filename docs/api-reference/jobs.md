---
sidebar_position: 4
---

# Jobs

Every notification you send creates a job. Jobs are processed asynchronously — the send endpoints return immediately with a job ID you can use to track delivery.

## Get Job Status

Retrieve the current status and details of a specific job.

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
| `jobId`   | `string` | Job ID returned from the send endpoint |

### Example

```bash
curl https://api.notifykit.dev/api/v1/notifications/jobs/job_abc123 \
  -H "X-API-Key: nh_your_key_here"
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
    "payload": {
      "to": "user@example.com",
      "subject": "Welcome!",
      "body": "<h1>Hello</h1>"
    },
    "attempts": 1,
    "maxAttempts": 3,
    "errorMessage": null,
    "createdAt": "2026-01-09T12:34:56.789Z",
    "startedAt": "2026-01-09T12:34:57.123Z",
    "completedAt": "2026-01-09T12:34:58.456Z",
    "deliveryLogs": [
      {
        "attempt": 1,
        "status": "SUCCESS",
        "usedProvider": "POSTMARK",
        "errorMessage": null,
        "createdAt": "2026-01-09T12:34:58.123Z"
      }
    ]
  },
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

#### `usedProvider` on delivery logs

Each entry in `deliveryLogs[]` includes a `usedProvider` field for email jobs:

| Value                                  | Meaning                                                              |
| -------------------------------------- | -------------------------------------------------------------------- |
| `"SENDGRID" \| "RESEND" \| "POSTMARK"` | Success rows: the provider that delivered. Failure rows: the last provider attempted. |
| `null`                                 | Pre-attempt failure (no provider tried) or webhook job.             |

This lets you audit which provider handled each attempt — useful for debugging multi-provider failover and per-message routing.

### Job Status Values

| Status       | Description                                      |
| ------------ | ------------------------------------------------ |
| `pending`    | Job is queued, waiting to be picked up           |
| `processing` | Job is actively being processed by a worker      |
| `completed`  | Job delivered successfully                        |
| `failed`     | Job exhausted all retry attempts without success |

### Error Response

**Status:** `404 Not Found`

```json
{
  "success": false,
  "error": "Job not found",
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

---

## List Jobs

Retrieve a paginated list of your jobs with optional filters.

### Endpoint

```
GET /api/v1/notifications/jobs
```

### Headers

| Header      | Value        | Required |
| ----------- | ------------ | -------- |
| `X-API-Key` | Your API key | Yes      |

### Query Parameters

| Parameter | Type     | Description                                                              | Default |
| --------- | -------- | ------------------------------------------------------------------------ | ------- |
| `page`    | `number` | Page number                                                              | `1`     |
| `limit`   | `number` | Jobs per page (max: 100)                                                 | `20`    |
| `type`    | `string` | Filter by type: `email` or `webhook`                                     | —       |
| `status`  | `string` | Filter by status: `pending`, `processing`, `completed`, or `failed`      | —       |

### Examples

#### List All Jobs

```bash
curl https://api.notifykit.dev/api/v1/notifications/jobs \
  -H "X-API-Key: nh_your_key_here"
```

#### Filter by Type

```bash
curl "https://api.notifykit.dev/api/v1/notifications/jobs?type=email" \
  -H "X-API-Key: nh_your_key_here"
```

#### Filter Failed Jobs

```bash
curl "https://api.notifykit.dev/api/v1/notifications/jobs?status=failed" \
  -H "X-API-Key: nh_your_key_here"
```

#### Pagination

```bash
curl "https://api.notifykit.dev/api/v1/notifications/jobs?page=2&limit=50" \
  -H "X-API-Key: nh_your_key_here"
```

#### Combined Filters

```bash
curl "https://api.notifykit.dev/api/v1/notifications/jobs?type=webhook&status=failed&page=1&limit=10" \
  -H "X-API-Key: nh_your_key_here"
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
        "priority": 5,
        "attempts": 1,
        "errorMessage": null,
        "createdAt": "2026-01-09T12:34:56.789Z",
        "completedAt": "2026-01-09T12:34:58.456Z"
      },
      {
        "id": "job_xyz789",
        "type": "webhook",
        "status": "failed",
        "priority": 5,
        "attempts": 3,
        "errorMessage": "Connection timeout",
        "createdAt": "2026-01-09T12:30:00.000Z",
        "completedAt": null
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

:::note
The list response does not include `payload`, `startedAt`, or `maxAttempts`. Use [Get Job Status](#get-job-status) for the full job record.
:::

---

## Retry Failed Job

Re-queue a failed job for another delivery attempt. Only jobs with `failed` status can be retried.

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
| `jobId`   | `string` | ID of the failed job |

### Example

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/jobs/job_xyz789/retry \
  -H "X-API-Key: nh_your_key_here"
```

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "jobId": "job_xyz789",
    "status": "pending",
    "message": "Job has been re-queued for processing"
  },
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

### Error Responses

#### 404 Not Found

Job doesn't exist or is not in `failed` status:

```json
{
  "success": false,
  "error": "Job not found or cannot be retried (must be in failed status)",
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

#### 400 Bad Request

Retrying a failed email job without any email provider configured (Indie/Startup plans):

```json
{
  "success": false,
  "error": "Please add at least one email provider API key (SendGrid, Resend, or Postmark) in settings before sending emails.",
  "timestamp": "2026-01-09T12:35:00.000Z"
}
```

:::info Retry Eligibility
Only jobs with `failed` status can be retried. Jobs that are `pending`, `processing`, or `completed` cannot be retried.
:::
