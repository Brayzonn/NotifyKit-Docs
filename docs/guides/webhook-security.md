---
sidebar_position: 3
---

# Webhook Security

When NotifyKit delivers a webhook to your endpoint, that endpoint is publicly accessible on the internet. This page covers how to authenticate incoming webhook requests and protect your endpoint from unauthorized calls.

## HMAC Signature Verification (Recommended)

NotifyKit can sign every outgoing webhook delivery with an HMAC-SHA256 signature. Your endpoint uses the signature to verify the delivery is genuinely from NotifyKit and that the payload has not been tampered with in transit.

### Set Up a Signing Secret

1. Go to **API Keys** in the dashboard.
2. Scroll to the **Webhook Security** section.
3. Click **Generate** to create a signing secret.

The secret is shown **once** — copy it and store it securely (e.g., as an environment variable). NotifyKit stores only an encrypted version; the plaintext is never shown again. You can rotate or delete the secret at any time.

### Signature Headers

When a signing secret is configured, NotifyKit includes two headers on every webhook delivery:

| Header                  | Example                        | Description                                      |
| ----------------------- | ------------------------------ | ------------------------------------------------ |
| `X-Webhook-Timestamp`   | `1746561234`                   | Unix timestamp (seconds) of when the delivery was made |
| `X-Webhook-Signature`   | `t=1746561234,v1=a3f...`       | HMAC-SHA256 signature with the timestamp prefix  |

### Signature Algorithm

The signature is computed as:

```
HMAC-SHA256(secret, "<timestamp>.<JSON body>")
```

Where:
- `secret` — your plaintext signing secret
- `timestamp` — the value from `X-Webhook-Timestamp`
- `JSON body` — the raw request body (`JSON.stringify(payload)`)

The `X-Webhook-Signature` header has the format `t=<timestamp>,v1=<hex signature>`.

### Verify at Your Endpoint

#### Using the SDK (recommended)

The `@notifykit/sdk` package exports a `verifyWebhookSignature` helper that handles parsing, timing-safe comparison, and replay protection for you.

```typescript
import express from "express";
import { verifyWebhookSignature } from "@notifykit/sdk";

const app = express();

// Raw body parser — required so the string is available before JSON parsing
app.use("/webhooks", express.raw({ type: "application/json" }));

app.post("/webhooks/orders", (req, res) => {
  const valid = verifyWebhookSignature({
    payload: req.body.toString("utf8"),                        // raw string
    timestamp: req.headers["x-webhook-timestamp"] as string,
    signature: req.headers["x-webhook-signature"] as string,
    secret: process.env.NOTIFYKIT_WEBHOOK_SECRET!,
    tolerance: 300,                                            // optional, default 300s
  });

  if (!valid) return res.status(401).json({ error: "Invalid signature" });

  const event = JSON.parse(req.body.toString("utf8"));
  console.log("Verified delivery:", event);
  res.status(200).json({ received: true });
});
```

`verifyWebhookSignature` returns `false` (never throws) on any failure — missing headers, malformed signature, timestamp outside the tolerance window, or digest mismatch.

Available since `@notifykit/sdk@1.3.0`.

#### Manual implementation (without the SDK)

```typescript
import express from "express";
import * as crypto from "crypto";

const app = express();

app.use("/webhooks", express.raw({ type: "application/json" }));

app.post("/webhooks/orders", (req, res) => {
  const rawBody = req.body.toString("utf8");
  const signatureHeader = req.headers["x-webhook-signature"] as string;
  const timestampHeader = req.headers["x-webhook-timestamp"] as string;
  const secret = process.env.NOTIFYKIT_WEBHOOK_SECRET!;

  if (!signatureHeader || !timestampHeader) {
    return res.status(401).json({ error: "Missing signature headers" });
  }

  // Reject stale deliveries outside the 5-minute window
  const ts = parseInt(timestampHeader, 10);
  if (Math.abs(Date.now() / 1000 - ts) > 300) {
    return res.status(401).json({ error: "Stale delivery" });
  }

  // Reconstruct the signed string and compute the expected signature
  const signed = `${timestampHeader}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");

  // Parse v1 from "t=<ts>,v1=<hex>"
  const match = signatureHeader.match(/v1=([a-f0-9]+)/);
  if (!match) return res.status(401).json({ error: "Invalid signature" });
  const received = match[1];

  // Constant-time comparison to prevent timing attacks
  const valid = crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(received, "hex"),
  );

  if (!valid) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const payload = JSON.parse(rawBody);
  console.log("Verified delivery:", payload);
  res.status(200).json({ received: true });
});
```

:::warning Parse the raw body, not the parsed object
Most frameworks (Express, Fastify) parse the JSON body before your handler runs. Signing uses the **raw byte string** — re-serializing a parsed object can change key order or whitespace and break verification. Always read `req.rawBody` or use a raw body middleware on the webhook route.
:::

:::tip Replay protection
The 5-minute timestamp tolerance in the example above rejects replayed deliveries. An attacker who captures a valid delivery cannot replay it after the window has expired.
:::

## Use HTTPS Endpoints

Always use HTTPS for your webhook URL. HTTP sends your payload in plaintext, exposing payload contents and any secret headers to observers on the network.

NotifyKit only accepts HTTPS webhook URLs. HTTP URLs are rejected with a `400` error.

## Keep Secrets Out of Payloads

Don't put sensitive data (API keys, tokens, PII) directly in the webhook payload. The payload is stored on the job record while the job is pending or failed, and is accessible to anyone with your API key via the Jobs API. Use the payload to send identifiers, then fetch sensitive data from your own API.

**Avoid:**

```typescript
await client.sendWebhook({
  url: "https://your-app.com/webhook",
  payload: {
    userId: "123",
    creditCard: "4111111111111111", // Bad
    apiToken: "sk_live_abc123",     // Bad
  },
});
```

**Prefer:**

```typescript
await client.sendWebhook({
  url: "https://your-app.com/webhook",
  payload: {
    event: "payment.completed",
    paymentId: "pay_abc123", // Fetch payment details from your own API
  },
});
```

## Handle Duplicate Deliveries

NotifyKit delivers webhooks at least once. Network issues or retries can result in the same webhook being delivered more than once. Your endpoint should be idempotent — processing the same event twice should produce the same result.

For production, persist a set of processed event identifiers in a database and check before processing each delivery.

## Respond Quickly

NotifyKit times out webhook requests after **30 seconds**. Heavy synchronous processing can trigger a retry.

**Best practice — acknowledge immediately, process in background:**

```typescript
app.post("/webhooks/orders", async (req, res) => {
  // Validate signature first
  const valid = verifyWebhookSignature(/* ... */);
  if (!valid) return res.status(401).end();

  // Respond immediately
  res.status(200).json({ received: true });

  // Process in background
  setImmediate(async () => {
    await processOrderEvent(req.body);
  });
});
```

## Best Practices Summary

| Practice                              | Why                                             |
| ------------------------------------- | ----------------------------------------------- |
| Use HMAC signature verification   | Cryptographically proves delivery is from NotifyKit |
| Check the timestamp tolerance     | Rejects replayed deliveries after the window    |
| Use HTTPS                         | Encrypts payload and headers in transit         |
| Make endpoints idempotent         | Handles duplicate deliveries safely             |
| Respond with 200 quickly          | Prevents unnecessary retries                    |
| Don't include secrets in payloads | Payload is stored on the job record until successful delivery |
| Send identifiers, not raw data    | Keeps sensitive data in your own system         |

## Next Steps

- [Retry Logic](/docs/guides/retry-logic)
- [Send Webhook](/docs/api-reference/send-webhook)
