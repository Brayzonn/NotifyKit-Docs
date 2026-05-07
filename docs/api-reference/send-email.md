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

| Header                   | Value                  | Notes                                              |
| ------------------------ | ---------------------- | -------------------------------------------------- |
| `X-API-Key`              | Your API key           | Use this or `Authorization: Bearer`, not both      |
| `Authorization: Bearer`  | Your API key           | Standard bearer token alternative to `X-API-Key`  |
| `Content-Type`           | `application/json`     | Required on all requests                           |

### Request Body

#### Required Fields

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| `to`      | `string` | Recipient email address — must be a valid email format   |
| `subject` | `string` | Email subject line — shown in the recipient's inbox      |
| `body`    | `string` | Email body — HTML is supported, plain text also works    |

#### Optional Fields

| Parameter        | Type           | Description                                                                                                                                           |
| ---------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`           | `string`       | Sender email address. Pass your root domain (e.g. `support@yourdomain.com`) — NotifyKit rewrites it to `support@em.yourdomain.com` before delivery, which is the subdomain your provider requires for sending. If omitted, defaults to `noreply@em.yourdomain.com` (paid plans with a verified domain) or `noreply@notifykit.dev` (Free plan). |
| `priority`       | `1 \| 5 \| 10` | Job priority (1=high, 5=normal, 10=low). Default: `5`. Paid plans only.                                                                               |
| `idempotencyKey` | `string`       | Unique key to prevent duplicate sends                                                                                                                 |
| `provider`       | `"SENDGRID" \| "RESEND" \| "POSTMARK"` | Force this email through a specific configured provider. Paid plans only. See [Per-Message Provider Routing](#per-message-provider-routing-paid-plans).  |
| `fallback`       | `"SENDGRID" \| "RESEND" \| "POSTMARK"` | Fallback provider tried only if `provider` fails. Requires `provider`. Paid plans only.                                                                |

### Custom Sender Rules (Paid Plans)

- Your domain must be verified in the **Domains** page of the dashboard before use. See [Domain Verification](/docs/guides/domain-verification).
- Use your root domain (e.g. `support@yourdomain.com`) — NotifyKit rewrites it to the correct sending subdomain automatically.
- If no `from` is provided, NotifyKit defaults to `noreply@em.yourdomain.com`.
- A verified sending domain is required for all paid plan email sends — requests without one will be rejected.

### Email Infrastructure by Plan

:::info Free Plan
Emails are sent via **NotifyKit's shared infrastructure** with automatic failover across supported providers. The sender address is always `noreply@notifykit.dev`. Custom `from` addresses are not supported.
:::

:::info Indie & Startup Plans
Emails are sent via **your own provider keys**. You must connect at least one provider API key in **API Keys** before sending emails. Without one, email requests will be rejected.

Configure multiple providers to enable automatic failover — NotifyKit delivers through them in the priority order you set in the dashboard. You can also force a specific provider for a single message; see [Per-Message Provider Routing](#per-message-provider-routing-paid-plans).

Custom `from` addresses (using your verified domain) are supported on paid plans.
:::

### Examples

#### Free Plan

**Simple email:**

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

**With idempotency key** (safe to retry on network failure):

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

#### Paid Plans

**High priority** (e.g. password resets, alerts):

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

**Low priority** (e.g. newsletters, digests):

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/email \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Your Monthly Newsletter",
    "body": "<h1>What'\''s new this month</h1>",
    "priority": 10
  }'
```

**Custom from address:**

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/email \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "from": "support@yourdomain.com",
    "subject": "We got your ticket",
    "body": "<p>We'\''ll get back to you within 24 hours.</p>"
  }'
```

:::info Domain Verification Required
Custom `from` addresses require a verified sender domain. See [Domain Verification](/docs/guides/domain-verification).
:::

**Full request:**

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/email \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "from": "billing@yourdomain.com",
    "subject": "Invoice #1042",
    "body": "<p>Your invoice is attached.</p>",
    "priority": 1,
    "idempotencyKey": "invoice-1042-email"
  }'
```

### Per-Message Provider Routing (Paid Plans)

By default, emails are delivered through your configured providers in priority order with full failover. You can override that for a single message by passing `provider` (and optionally `fallback`) in the request body.

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/email \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Receipt",
    "body": "<p>Thanks for your order.</p>",
    "provider": "POSTMARK",
    "fallback": "SENDGRID"
  }'
```

**Behavior:**

| Field      | Effect                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `provider` | The email is sent through this provider only. If it fails and `fallback` is unset, the job is marked failed — no other providers are tried. |
| `fallback` | If `provider` fails, this provider is tried next. Other configured providers are skipped.                                      |

**Retries and attempt counting:**

Trying your `fallback` after `provider` fails counts as one attempt — failover happens within a single attempt, not across separate retries. If both fail, the job is permanently failed with no automatic retries. If the job is manually retried, the same `provider` and `fallback` values are used — your other configured providers are never tried.

Without forced routing, each attempt tries your full provider list before counting as failed. The job is retried up to 3 times total before moving to failed status. See [Retry Logic](/docs/guides/retry-logic).

**Validation errors:**

| Condition                                    | Response          | Error message                                              |
| -------------------------------------------- | ----------------- | ---------------------------------------------------------- |
| `fallback` set without `provider`            | `400 Bad Request` | `` `fallback` requires `provider` to be set ``             |
| `provider` and `fallback` are the same value | `400 Bad Request` | `` `provider` and `fallback` must be different ``          |
| `provider` not configured for this account   | `400 Bad Request` | `Provider {X} is not configured for this customer`         |
| `fallback` not configured for this account   | `400 Bad Request` | `Fallback provider {X} is not configured for this customer`|
| `provider` or `fallback` used on Free plan   | `403 Forbidden`   | `Per-message provider routing requires a paid plan`        |

When neither field is set, behavior is unchanged — the worker tries your full priority list with full failover.

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

**No email provider configured:**

```json
{
  "success": false,
  "error": "Please add at least one email provider API key (SendGrid, Resend, or Postmark) in Settings before sending emails.",
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
