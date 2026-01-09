---
sidebar_position: 1
---

# Authentication

Authenticate your API requests with API keys.

### API Keys

All API requests require an API key passed in the `X-API-Key` header.

```bash
curl https://api.notifyhub.com/api/v1/ping \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

### Getting Your API Key

1. Log in to your NotifyHub dashboard
2. Navigate to Settings → API Keys
3. Click "Create API Key"
4. Copy your key (shown only once)

### Key Types

#### Development Keys

```
ntfy_sk_dev_...
```

- For testing
- Limited rate limits
- Free tier

#### Production Keys

```
ntfy_sk_live_...
```

- For production use
- Higher rate limits
- Paid plans

### Security Best Practices

:::danger Keep Keys Secret
Never commit API keys to version control or expose them in client-side code.
:::

#### Environment Variables

```bash
# .env
NOTIFYHUB_API_KEY=ntfy_sk_live_your_key_here
```

```javascript
// Load from environment variables
const apiKey = process.env.NOTIFYHUB_API_KEY;
```

### Rate Limits

| Plan    | Rate Limit       |
| ------- | ---------------- |
| Free    | 10 requests/min  |
| Indie   | 100 requests/min |
| Startup | 500 requests/min |

### Testing Authentication

Test your API key by calling the info endpoint:

```bash
curl https://api.notifyhub.com/api/v1/info \
  -H "X-API-Key: ntfy_sk_live_your_key_here"
```

**Response:**

```json
{
  "name": "NotifyHub API",
  "version": "1.0.0",
  "description": "Notification infrastructure service for emails and webhooks",
  "documentation": "https://docs.notifyhub.com"
}
```
