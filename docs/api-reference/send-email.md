---
sidebar_position: 2
---

# Send Email

Queue an email notification for delivery.

### Endpoint

```
POST /api/v1/notifications/email
```

### Headers

| Header         | Value              | Required |
| -------------- | ------------------ | -------- |
| `X-API-Key`    | Your API key       | Yes      |
| `Content-Type` | `application/json` | Yes      |

### Request Body

#### Required Fields

| Parameter | Type     | Description                 |
| --------- | -------- | --------------------------- |
| `to`      | `string` | Recipient email address     |
| `subject` | `string` | Email subject line          |
| `body`    | `string` | Email body (HTML supported) |

#### Optional Fields

| Parameter        | Type           | Description                                                                                                                                           |
| ---------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`           | `string`       | Sender email address. Use your verified domain (e.g. `support@yourdomain.com`). NotifyKit automatically rewrites it to the correct sending subdomain. |
| `priority`       | `1 \| 5 \| 10` | Job priority (1=high, 5=normal, 10=low). Default: `5`                                                                                                 |
| `idempotencyKey` | `string`       | Unique key to prevent duplicate sends                                                                                                                 |

### Custom Sender Rules (Paid Plans)

- Your domain must be verified.
- Use your verified domain directly (e.g. `support@yourdomain.com`) — NotifyKit handles the rest.
- If no `from` is provided, NotifyKit defaults to `noreply@em.yourdomain.com`.
- A verified sending domain is required for all paid plan email sends — requests without one will be rejected.

### Email Infrastructure by Plan

:::info Free Plan
Emails are sent via **NotifyKit's shared SendGrid account**. The sender address is always `noreply@notifykit.dev`. Custom `from` addresses are not supported.
:::

:::info Indie & Startup Plans
Emails are sent via **your own SendGrid account**. You must connect your SendGrid API key in **Settings → Email Provider** before sending emails. Without it, email requests will be rejected.

Custom `from` addresses (using your verified domain) are supported on paid plans.

> **Coming soon:** Support for Resend, Mailgun, and AWS SES.
> :::

### Examples

#### Simple Email

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/email \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Order Confirmation",
    "body": "<p>Your order #12345 has been confirmed.</p>"
  }'
```

#### High Priority Email

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/email \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Password Reset",
    "body": "<p>Click here to reset your password.</p>",
    "priority": 1
  }'
```

#### Custom From Address (Paid Plans Only)

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/email \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "from": "support@yourdomain.com",
    "subject": "Newsletter",
    "body": "<h1>Monthly Update</h1>"
  }'
```

:::info Domain Verification Required
Custom `from` addresses require a verified sender domain. See [Domain Verification](/docs/guides/domain-verification).
:::

### Idempotent Requests

Use an `idempotencyKey` to prevent duplicate jobs if the same request is sent more than once
(e.g., your client retries after a network timeout). If a job with the same key already exists,
the API returns `409 Conflict` and no new job is created.

To retry a **failed** job, use the [Retry Job](/docs/api-reference/jobs) endpoint instead —
idempotency keys do not apply there.

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/email \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Payment Confirmation",
    "body": "<p>Payment received.</p>",
    "idempotencyKey": "payment-12345"
  }'
```

### Response

Emails are queued immediately and processed asynchronously by a background worker. The response confirms the job was accepted, not that the email was delivered. Use [Get Job Status](/docs/api-reference/jobs) to check delivery.

**Status:** `202 Accepted`

```json
{
  "success": true,
  "data": {
    "jobId": "job_abc123",
    "status": "pending",
    "type": "email",
    "createdAt": "2026-01-09T12:34:56.789Z"
  },
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

### Error Responses

#### 400 Bad Request

Invalid input (e.g., invalid email format, missing required field):

```json
{
  "success": false,
  "error": "to must be an email",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

#### 403 Forbidden

Plan or domain requirements not met:

**SendGrid key not configured:**

```json
{
  "success": false,
  "error": "Please add your SendGrid API key in Settings before sending emails.",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

**No sending domain configured:**

```json
{
  "success": false,
  "error": "Paid plans must use a verified sending domain. Please add and verify your domain in Settings.",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

**Domain pending verification:**

```json
{
  "success": false,
  "error": "Your sending domain is pending verification. Please complete domain verification in Settings.",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

#### 409 Conflict

Duplicate `idempotencyKey` — email was already queued:

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

## Next Steps

- [Domain Verification](/docs/guides/domain-verification)
- [Check Job Status](/docs/api-reference/jobs)
- [Webhooks](/docs/api-reference/send-webhook)
