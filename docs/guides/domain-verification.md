---
sidebar_position: 1
---

# Domain Verification

Verify a custom sender domain to send emails from your own address (e.g., `support@yourdomain.com`) instead of NotifyKit's default `noreply@notifykit.dev`.

## Requirements

:::info Plan Requirement
Custom domain verification is available on **Indie** and **Startup** plans only. Free plan emails always send from `noreply@notifykit.dev`.
:::

:::info Email Provider
Domain verification registers your domain with each email provider you have configured. To verify a domain, you must have at least one provider API key connected in **API Keys**.
:::

:::info Postmark — Account Token Required
Postmark uses two separate tokens. The **Server Token** is for sending mail; domain operations (create, verify, delete) require an additional **Account Token**. If you've connected Postmark and plan to verify a custom sending domain through it, also paste your Postmark Account Token in **API Keys → Postmark**. Find it in your Postmark dashboard under **Account → API Tokens**. Without it, NotifyKit will skip Postmark during domain registration.
:::

:::warning One Domain Per Account
You can only verify **one domain** per account at a time. To switch to a different domain, remove the existing one first.
:::

## How It Works

NotifyKit registers your domain with every email provider you have configured and generates DNS records for each. Once you add those records to your DNS provider, you trigger verification. When all providers confirm your domain, it becomes active for sending.

If you have multiple providers configured, you will receive DNS records from each. All records must be added — NotifyKit delivers through providers in priority order and falls back automatically if one fails.

## Step 1: Request Verification

Go to **Domains** in the NotifyKit dashboard and enter your domain name.

NotifyKit registers your domain with every provider you have configured and returns the DNS records required by each. The exact records — their type, host, and value — depend on the provider and are generated at registration time. Copy them directly from the dashboard.

## Step 2: Add DNS Records

Log in to your DNS provider and add every record shown in the dashboard. Use the exact **Type**, **Host**, and **Value** from each row — records can be `CNAME` or `TXT` depending on the provider.

A few things to watch out for:

- **Cloudflare:** set Proxy status to **DNS only** (gray cloud). Proxying DNS records will break verification.
- **Subdomain-only hosts:** some DNS providers expect just the subdomain part (e.g., `em8724`) rather than the full hostname (`em8724.yourdomain.com`). Check your provider's docs if a record fails to save.
- **Conflicting records:** delete any existing records for the same hostname before adding new ones.

## Step 3: Verify Domain

DNS propagation typically takes 15–60 minutes, but can take up to 24 hours.

Once you've added all records and waited for propagation, go to **Domains** and click **Verify Domain**.

Your domain is considered verified when **all configured providers** confirm it. Every connected provider must pass.

**Troubleshooting:**

```bash
# Check if a record has propagated (replace with the host shown in the dashboard)
dig _domainkey.yourdomain.com TXT
```

**Common issues:**

| Issue                          | Fix                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| Proxy enabled (Cloudflare)     | Disable proxy — use "DNS only"                                                        |
| Full hostname entered as Host  | Some providers need just the subdomain (e.g., `em8724`), not `em8724.yourdomain.com` |
| Old records conflict           | Delete any existing records for the same hostname first                               |
| TTL too high                   | Lower to 300 seconds (5 min) for faster propagation                                   |

## Step 4: Send from Your Domain

Once verified, paid plan emails automatically use `noreply@em.yourdomain.com` as the default sender when you don't specify a `from` address.

:::warning Domain Required for Paid Plans
A verified sending domain is required for all paid plan email sends. Requests without a verified domain will be rejected with a `403` error.
:::

### Automatic From Address

| Plan            | Domain status | Default sender              |
| --------------- | ------------- | --------------------------- |
| Indie / Startup | Verified      | `noreply@em.yourdomain.com` |
| Indie / Startup | Not verified  | Request rejected            |

Free plan emails always send from `noreply@notifykit.dev` — domain verification is not available on the Free plan.

### Specifying a Custom Sender

Use your verified domain directly in the `from` field — NotifyKit rewrites it to `em.yourdomain.com` before delivery (e.g. `support@yourdomain.com` becomes `support@em.yourdomain.com`):

```typescript
await client.sendEmail({
  to: "user@example.com",
  from: "support@yourdomain.com",
  subject: "We got your ticket",
  body: "We'll get back to you within 24 hours.",
});
```

```bash
curl -X POST https://api.notifykit.dev/api/v1/notifications/email \
  -H "X-API-Key: nh_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "from": "orders@yourdomain.com",
    "subject": "Order Shipped",
    "body": "<p>Your order is on the way!</p>"
  }'
```

### Common Errors

**No sending domain configured:**

```json
{
  "error": "Paid plans must use a verified sending domain. Please add and verify your domain in Settings."
}
```

**Domain pending verification:**

```json
{
  "error": "Your sending domain is pending verification. Please complete domain verification in Settings."
}
```

**Using an unrecognized domain in `from`:**

```json
{
  "error": "Cannot send from support@otherdomain.com. Use your verified domain yourdomain.com instead."
}
```

**Trying to use an unauthorized NotifyKit address:**

```json
{
  "error": "Cannot send from custom@notifykit.dev. Only noreply@notifykit.dev is allowed."
}
```

## DMARC (Optional but Recommended)

Add a DMARC record to your DNS to improve deliverability and get reports on authentication failures:

```
Type: TXT
Host: _dmarc.yourdomain.com
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com
```

Start with `p=none` (monitoring only). After reviewing reports and confirming legitimate mail passes, you can tighten to `p=quarantine` or `p=reject`.

## Next Steps

- [Send Email](/docs/api-reference/send-email)
- [Email Templates](/docs/examples/email-templates)
