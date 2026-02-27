---
sidebar_position: 1
---

# Domain Verification

Verify a custom sender domain to send emails from your own address (e.g., `support@em.yourapp.com`) instead of NotifyKit's default `noreply@notifykit.dev`.

## Requirements

:::info Plan Requirement
Custom domain verification is available on **Indie** and **Startup** plans only. Free plan emails always send from `noreply@notifykit.dev`.
:::

:::info Email Provider
Domain verification currently uses **SendGrid**. You must have your SendGrid API key connected in **Settings → Email Provider** before requesting domain verification.

> **Coming soon:** Support for Resend, Mailgun, and AWS SES.
:::

:::warning One Domain Per Account
You can only verify **one domain** per account at a time. To switch to a different domain, remove the existing one first.
:::

## How It Works

NotifyKit registers your domain with SendGrid and generates three CNAME DNS records. Once you add those records to your DNS provider, you trigger verification. If DNS has propagated correctly, your domain becomes active for sending.

## Step 1: Request Verification

Go to **Settings → Domain** in the NotifyKit dashboard and enter your domain name.

You'll receive three CNAME records that look like:

```
Type: CNAME
Host: em8724.yourdomain.com
Value: u12345678.wl123.sendgrid.net

Type: CNAME
Host: s1._domainkey.yourdomain.com
Value: s1.domainkey.u12345678.wl123.sendgrid.net

Type: CNAME
Host: s2._domainkey.yourdomain.com
Value: s2.domainkey.u12345678.wl123.sendgrid.net
```

**What each record does:**

| Record | Purpose |
| ------ | ------- |
| `em####.yourdomain.com` | Routes email through SendGrid's infrastructure |
| `s1._domainkey.yourdomain.com` | DKIM signature — proves emails are from you |
| `s2._domainkey.yourdomain.com` | Backup DKIM signature |

## Step 2: Add DNS Records

Log in to your DNS provider and add all three CNAME records.

### Cloudflare

1. Go to **DNS** → **Records**
2. Click **Add record**
3. Type: `CNAME`
4. Name: the `Host` value (e.g., `em8724`)
5. Target: the `Value` (e.g., `u12345678.wl123.sendgrid.net`)
6. **Proxy status: DNS only** (gray cloud — do not proxy)
7. Repeat for all three records

### Namecheap

1. Go to **Domain List** → **Manage** → **Advanced DNS**
2. Click **Add New Record**
3. Type: `CNAME Record`
4. Host: the subdomain part only (e.g., `em8724`)
5. Value: the full target value
6. TTL: `Automatic`

### Other Providers

Most DNS providers have the same fields under different names (e.g., "Alias", "Destination", "Points to"). Enter the subdomain for the Host field and the full target for the Value field.

## Step 3: Verify Domain

DNS propagation typically takes 15–60 minutes, but can take up to 24 hours.

Once you've added the records and waited for propagation, go to **Settings → Domain** and click **Verify Domain**.

If all three records resolve correctly, your domain status changes to `verified`.

**Troubleshooting:**

```bash
# Check if your CNAME record is visible
dig em8724.yourdomain.com CNAME

# Expected output:
# em8724.yourdomain.com. 300 IN CNAME u12345678.wl123.sendgrid.net.
```

If the dig returns no result or a wrong value, the record hasn't propagated or was entered incorrectly.

**Common issues:**

| Issue | Fix |
| ----- | --- |
| Proxy enabled (Cloudflare) | Disable proxy — use "DNS only" |
| Full hostname entered as Host | Some providers need just the subdomain (e.g., `em8724`), not `em8724.yourdomain.com` |
| Old records conflict | Delete any existing records for the same hostname first |
| TTL too high | Lower to 300 seconds (5 min) for faster propagation |

## Step 4: Send from Your Domain

Once verified, emails automatically use `noreply@em.yourdomain.com` as the default sender (when you don't specify `from`).

### Automatic From Address

| Domain status   | Default sender                     |
| --------------- | ---------------------------------- |
| Verified        | `noreply@em.yourdomain.com`        |
| Not verified    | `noreply@notifykit.dev`            |

### Specifying a Custom Sender

You can send from any address on the `em.` subdomain of your verified domain:

```typescript
await client.sendEmail({
  to: "user@example.com",
  from: "support@em.yourdomain.com",
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
    "from": "orders@em.yourdomain.com",
    "subject": "Order Shipped",
    "body": "<p>Your order is on the way!</p>"
  }'
```

### The `em.` Subdomain Requirement

:::warning Use `em.yourdomain.com`, not `yourdomain.com`
The DNS verification creates records on the `em.` subdomain. Emails must be sent from addresses on that subdomain.

- **Correct:** `support@em.yourdomain.com`
- **Incorrect:** `support@yourdomain.com` (will be rejected)
:::

**Why use a subdomain?**

Using `em.yourdomain.com` for transactional emails keeps your sending reputation separate from your main domain. If a transactional email campaign causes spam complaints, it doesn't affect the deliverability of emails sent from `team@yourdomain.com`.

**What recipients see:**

Most email clients display the sender as `yourdomain.com`, so recipients see the email as coming from your brand.

### Common Errors

**Using root domain instead of `em.` subdomain:**

```
Error: Cannot send from support@yourdomain.com.
Use em.yourdomain.com instead (e.g., support@em.yourdomain.com)
```

**Domain not yet verified:**

```
Error: Cannot send from noreply@em.yourdomain.com.
Domain yourdomain.com is not verified.
```

**Trying to use an unauthorized NotifyKit address:**

```
Error: Cannot send from custom@notifykit.dev.
Only noreply@notifykit.dev is allowed for the NotifyKit domain.
```

## Removing a Domain

To remove your current verified domain (so you can add a different one), go to **Settings → Domain** and click **Remove Domain**. Emails will revert to sending from `noreply@notifykit.dev` immediately.

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
