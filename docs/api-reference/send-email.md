---
sidebar_position: 2
---

# Send Email

Send email notifications via SendGrid.

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

| Parameter        | Type     | Description                             |
| ---------------- | -------- | --------------------------------------- |
| `from`           | `string` | Sender email (requires verified domain) |
| `idempotencyKey` | `string` | Unique key to prevent duplicate sends   |

### Examples

#### Simple Email

```bash
curl -X POST https://api.notifyhub.com/api/v1/notifications/email \
  -H "X-API-Key: ntfy_sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Order Confirmation",
    "body": "<p>Your order #12345 has been confirmed.</p>"
  }'
```

#### HTML Email Template

```bash
curl -X POST https://api.notifyhub.com/api/v1/notifications/email \
  -H "X-API-Key: ntfy_sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Welcome!",
    "body": "<!DOCTYPE html><html><body style=\"margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;\"><table role=\"presentation\" width=\"600\" style=\"margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px;\"><tr><td style=\"text-align: center;\"><h1 style=\"color: #333; margin: 0 0 20px 0;\">Welcome John!</h1><p style=\"color: #666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;\">Thanks for signing up. Click below to confirm your email.</p><table role=\"presentation\" style=\"margin: 0 auto;\"><tr><td style=\"background-color: #2563eb; border-radius: 4px;\"><a href=\"https://example.com/confirm?token=abc123\" style=\"display: inline-block; padding: 12px 32px; color: #ffffff; text-decoration: none; font-weight: bold;\">Confirm Email</a></td></tr></table><p style=\"color: #999; font-size: 14px; margin: 30px 0 0 0;\">© 2025 YourCompany. All rights reserved.</p></td></tr></table></body></html>"
  }'
```

#### Custom From Address

```bash
curl -X POST https://api.notifyhub.com/api/v1/notifications/email \
  -H "X-API-Key: ntfy_sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "from": "noreply@yourdomain.com",
    "subject": "Newsletter",
    "body": "<h1>Monthly Update</h1>"
  }'
```

:::info Domain Verification Required
Custom `from` addresses require domain verification. See [Domain Verification](/docs/guides/domain-verification).
:::

### Idempotent Requests

Prevent duplicate emails by using an idempotency key:

```bash
curl -X POST https://api.notifyhub.com/api/v1/notifications/email \
  -H "X-API-Key: ntfy_sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Payment Confirmation",
    "body": "<p>Payment received</p>",
    "idempotencyKey": "payment-12345"
  }'
```

Sending again with the same `idempotencyKey` returns `409 Conflict` with the original job details.

### Response

#### Success Response

**Status:** `200 OK`

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

#### Error Responses

##### 400 Bad Request

Invalid request parameters (e.g., invalid email format):

```json
{
  "success": false,
  "error": "Invalid email address",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

#### 403 Forbidden

Domain not verified (when using custom `from` address):

```json
{
  "success": false,
  "error": "Domain not verified. Please verify yourdomain.com first.",
  "timestamp": "2026-01-09T12:34:56.789Z"
}
```

#### 409 Conflict

Duplicate idempotency key:

```json
{
  "success": false,
  "error": "Email already sent with this idempotency key",
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

## Next Steps

- [Domain Verification](/docs/guides/domain-verification)
- [Check Job Status](/docs/api-reference/jobs)
- [Webhooks](/docs/api-reference/webhooks)
