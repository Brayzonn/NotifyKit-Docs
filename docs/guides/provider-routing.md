---
sidebar_position: 1
---

# Provider Routing & Failover

NotifyKit routes every outbound email through a chain of configured providers. If one fails, the next in your priority order takes over automatically — no code changes, no manual intervention, no emails dropped because a provider had an outage.

## How It Works

When an email job is picked up by a worker, NotifyKit resolves an ordered list of providers to try:

1. **Free plan** — NotifyKit's shared infrastructure tries its platform-level providers in a fixed internal order until one succeeds.
2. **Paid plans** — NotifyKit tries your configured providers in the priority order you set in **Email Providers** in your dashboard.

On each attempt, NotifyKit calls the first provider in the list. If that provider returns an error or times out, it logs the failure and immediately tries the next one. The first successful response wins — the job is marked delivered and no further providers are tried.

This all happens within a single job attempt. The retry system (up to 3 attempts with exponential backoff) is a separate layer on top — if every provider in your list fails on attempt 1, BullMQ retries the entire chain again on attempts 2 and 3.

## Paid Plans: Connecting Providers

On Indie and Startup plans, you bring your own provider API keys. Go to **API Keys** and connect any combination of supported providers. Each provider you connect becomes available for email delivery and domain verification.

Once connected, go to **Email Providers** to see your configured providers and their current priority order.

## Setting Priority Order

Go to **Email Providers** in the dashboard and drag your providers into the order you want. The provider at the top is tried first — if it fails, the next one takes over automatically within the same job.

## Automatic Failover

Failover is always on. You don't configure it separately — it's just how the worker processes your provider list.

What triggers a failover to the next provider:

- Any error thrown by the provider SDK — including 4xx and 5xx responses, timeouts, and network errors

What does **not** trigger failover:

- An `UnrecoverableError` from a feature gate check (e.g. no verified domain, no provider configured) — these fail the job immediately without trying further providers

Each attempt is recorded in the job's delivery logs with the provider used, HTTP status, response body, and error message — so you can see exactly which provider delivered the email and which ones were tried before it.

## Per-Message Provider Routing

Paid plans can override the default priority order for a single email by passing `provider` and optionally `fallback` on the send request.

```typescript
await client.sendEmail({
  to: "user@example.com",
  subject: "Your invoice",
  body: "<p>...</p>",
  provider: "SENDGRID", // force this provider
  fallback: "RESEND", // try this if SENDGRID fails
});
```

```http
POST /api/v1/notifications/email
{
  "to": "user@example.com",
  "subject": "Your invoice",
  "body": "<p>...</p>",
  "provider": "SENDGRID",
  "fallback": "RESEND"
}
```

### Rules

| Condition                                         | Result                                                                                         |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `provider` set, `fallback` omitted                | Only `provider` is tried. If it fails, the job fails — no other providers are attempted.       |
| Both `provider` and `fallback` set                | `provider` is tried first. If it fails, `fallback` is tried. No other providers are attempted. |
| `fallback` set without `provider`                 | `400 Bad Request`                                                                              |
| `provider` equals `fallback`                      | `400 Bad Request`                                                                              |
| Either value is a provider you haven't configured | `400 Bad Request`                                                                              |
| Used on a Free plan                               | `403 Forbidden`                                                                                |

Per-message routing is a contract — it restricts the attempt set to exactly what you specified. The routing fields are stored on the job, so manual retries replay the same restriction.

Use this when you need a specific provider for compliance, deliverability, or cost reasons on a particular message, while letting other emails use your default priority order.

## Free Plan

On the Free plan, all emails are sent through NotifyKit's shared infrastructure. You cannot configure which providers are used or in what order. The `usedProvider` field on delivery logs is always `null` for Free plan jobs.

To connect your own provider keys and control routing, upgrade to the Indie or Startup plan.

## Related

- [Domain Verification](/docs/guides/domain-verification) — verify your sending domain across all configured providers
- [Send Email API Reference](/docs/api-reference/send-email) — full field reference including `provider` and `fallback`
- [Delivery Logs](/docs/api-reference/jobs) — inspect which provider was used on each attempt
