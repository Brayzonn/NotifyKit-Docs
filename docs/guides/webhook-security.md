---
sidebar_position: 3
---

# Webhook Security

When NotifyKit delivers a webhook to your endpoint, that endpoint is publicly accessible on the internet. This page covers how to authenticate incoming webhook requests and protect your endpoint from unauthorized calls.

## Authenticate with a Shared Secret

The most reliable way to secure your webhook endpoint is to include a shared secret in the request headers when you send the webhook. Your endpoint then verifies that the header is present and matches the expected value.

**Step 1 — Include a secret header when sending:**

```typescript
const secret = process.env.WEBHOOK_SECRET; // A strong random string

await client.sendWebhook({
  url: "https://your-app.com/webhooks/orders",
  payload: {
    event: "order.placed",
    orderId: "order_123",
  },
  headers: {
    "X-Webhook-Secret": secret,
  },
  idempotencyKey: "order-123-placed",
});
```

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/webhook \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/orders",
    "payload": { "event": "order.placed", "orderId": "order_123" },
    "headers": {
      "X-Webhook-Secret": "your_shared_secret_here"
    }
  }'
```

**Step 2 — Validate the secret at your endpoint:**

```typescript
// Express.js example
app.post("/webhooks/orders", (req, res) => {
  const incomingSecret = req.headers["x-webhook-secret"];
  const expectedSecret = process.env.WEBHOOK_SECRET;

  if (!incomingSecret || incomingSecret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Process the payload
  const { event, orderId } = req.body;
  console.log(`Received ${event} for order ${orderId}`);

  res.status(200).json({ received: true });
});
```

:::warning Return 200 for unauthorized requests (optional)
Returning `401` for invalid secrets will stop NotifyKit from retrying (4xx responses are not retried). If you'd prefer to silently discard invalid requests while still acknowledging receipt, return `200` and log the failure.
:::

## Use HTTPS Endpoints

Always use HTTPS for your webhook URL. HTTP sends your payload in plaintext, exposing the payload contents and any secret headers to anyone who can observe the network traffic.

NotifyKit only accepts HTTPS webhook URLs. HTTP URLs are rejected at the API level with a `400` error.

## Keep Secrets Out of Payloads

Don't put sensitive data (API keys, tokens, PII) directly in the webhook payload. Payloads are logged in the NotifyKit dashboard for debugging. Use the payload to send identifiers, then fetch sensitive data from your own API.

**Avoid:**

```typescript
// Don't put secrets in the payload
await client.sendWebhook({
  url: "https://your-app.com/webhook",
  payload: {
    userId: "123",
    creditCard: "4111111111111111", // Bad
    apiToken: "sk_live_abc123", // Bad
  },
});
```

**Prefer:**

```typescript
// Send only identifiers — fetch details server-side
await client.sendWebhook({
  url: "https://your-app.com/webhook",
  payload: {
    event: "payment.completed",
    paymentId: "pay_abc123", // Fetch payment details from your own API
  },
});
```

## Handle Duplicate Deliveries

NotifyKit delivers webhooks at least once. Network issues or retries can result in the same webhook being delivered more than once. Your endpoint should be idempotent.

**Simple deduplication with a seen-events set:**

```typescript
const processedEvents = new Set<string>();

app.post("/webhooks/orders", (req, res) => {
  const secret = req.headers["x-webhook-secret"];
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(200).end(); // Silently discard
  }

  const { event, orderId } = req.body;
  const eventId = `${event}:${orderId}`;

  if (processedEvents.has(eventId)) {
    // Already handled — acknowledge without re-processing
    return res.status(200).json({ duplicate: true });
  }

  processedEvents.add(eventId);

  // Process the event
  handleOrderEvent(event, orderId);

  res.status(200).json({ received: true });
});
```

For production, persist processed IDs in a database rather than an in-memory set.

## Respond Quickly

NotifyKit times out webhook requests that take too long to respond. If your endpoint does heavy processing synchronously, it may time out and trigger a retry.

**Best practice — acknowledge first, process in background:**

```typescript
app.post("/webhooks/orders", async (req, res) => {
  // Validate secret
  if (req.headers["x-webhook-secret"] !== process.env.WEBHOOK_SECRET) {
    return res.status(200).end();
  }

  // Respond immediately
  res.status(200).json({ received: true });

  // Process in background
  setImmediate(async () => {
    await processOrderEvent(req.body);
  });
});
```

## Best Practices Summary

| Practice                          | Why                                          |
| --------------------------------- | -------------------------------------------- |
| Use a shared secret header        | Prevents unauthorized calls to your endpoint |
| Use HTTPS                         | Encrypts payload and headers in transit      |
| Make endpoints idempotent         | Handles duplicate deliveries safely          |
| Respond with 200 quickly          | Prevents unnecessary retries                 |
| Don't include secrets in payloads | Payload content is visible in delivery logs  |
| Send identifiers, not raw data    | Keeps sensitive data in your own system      |

## Next Steps

- [Retry Logic](/docs/guides/retry-logic)
- [Send Webhook](/docs/api-reference/send-webhook)
