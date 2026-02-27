---
sidebar_position: 1
---

# Authentication

All API requests require an API key. Keys are prefixed with `nh_`

### API Key Headers

**`X-API-Key` header:**

```bash
curl https://api.notifykit.dev/api/v1/ping \
  -H "X-API-Key: nh_your_key_here"
```

### Getting Your API Key

1. Log in to your NotifyKit dashboard
2. Navigate to **Settings → API Keys**
3. Click **Generate API Key**
4. Copy your key — it is shown only once

### Key Format

API keys use the `nh_` prefix followed by 64 lowercase hexadecimal characters:

```
nh_[64 hex chars]
```

Example: `nh_a1b2c3d4...` (68 characters total)

### Security Best Practices

:::danger Keep Keys Secret
Never commit API keys to version control or expose them in client-side code. If a key is compromised, regenerate it immediately from the dashboard.
:::

Store your key in an environment variable:

```bash
# .env
NOTIFYKIT_API_KEY=nh_your_key_here
```

```typescript
const client = new NotifyKitClient({
  apiKey: process.env.NOTIFYKIT_API_KEY!,
});
```

### Error Responses

| Status             | Cause                                       |
| ------------------ | ------------------------------------------- |
| `401 Unauthorized` | API key missing, wrong format, or not found |
| `403 Forbidden`    | Account inactive or deleted                 |

**401 — Missing key:**

```json
{
  "success": false,
  "error": "API key is missing",
  "timestamp": "2026-01-09T12:00:00.000Z"
}
```

**401 — Invalid key:**

```json
{
  "success": false,
  "error": "Invalid API key",
  "timestamp": "2026-01-09T12:00:00.000Z"
}
```

### Rate Limits

Requests are rate-limited per API key within a 1-minute rolling window.

| Plan    | Rate Limit       |
| ------- | ---------------- |
| Free    | 5 requests/min   |
| Indie   | 50 requests/min  |
| Startup | 200 requests/min |

When the limit is exceeded, the API returns `429 Too Many Requests`:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "timestamp": "2026-01-09T12:00:00.000Z"
}
```

### Monthly Quotas

In addition to rate limits, each plan has a monthly notification quota:

| Plan    | Monthly Quota                                        |
| ------- | ---------------------------------------------------- |
| Free    | 100 total notifications (emails + webhooks combined) |
| Indie   | 4,000 webhook notifications + unlimited emails       |
| Startup | 15,000 webhook notifications + unlimited emails      |

:::info Email vs. Webhook Counting
On **Free**, every sent notification (email or webhook) counts toward your monthly limit.

On **Indie** and **Startup**, **emails are unlimited** and do not count toward the monthly quota. Only webhook notifications count.
:::

When your monthly quota is exceeded:

```json
{
  "success": false,
  "error": "Monthly usage limit exceeded (100/100). Upgrade your plan or wait for reset on 2/1/2026.",
  "timestamp": "2026-01-09T12:00:00.000Z"
}
```

### Verify Your Key

Test that your API key works by calling the ping endpoint:

```bash
curl https://api.notifykit.dev/api/v1/ping \
  -H "X-API-Key: nh_your_key_here"
```

**Response:**

```json
{
  "success": true,
  "data": { "message": "pong" },
  "timestamp": "2026-01-09T12:00:00.000Z"
}
```
