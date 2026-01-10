---
sidebar_position: 1
---

# Domain Verification

Verify your custom domain to send emails from your own domain.

## Why Verify a Domain?

By default, emails are sent from `noreply@notifyhub.com`. Verifying your domain allows you to send from your custom domain, which:

- Improves email deliverability
- Builds trust with recipients
- Maintains brand consistency

## Requirements

:::info Plan Requirement
Custom domains are available on **Indie** and **Startup** plans only.
:::

:::warning One Domain Per Account
You can only verify **one custom domain** per account. To use a different domain, you must first remove your existing verified domain.
:::

## Step 1: Request Verification

```typescript
const result = await client.requestDomainVerification("yourdomain.com");

console.log(result.dnsRecords);
// [
//   { type: 'CNAME', host: 'em.yourdomain.com', value: 'sendgrid.net' },
//   { type: 'CNAME', host: 's1._domainkey.yourdomain.com', value: '...' },
//   { type: 'CNAME', host: 's2._domainkey.yourdomain.com', value: '...' }
// ]
```

## Step 2: Add DNS Records

Log in to your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.) and add the CNAME records:

### Example for Cloudflare:

1. Go to DNS settings
2. Click "Add record"
3. Type: `CNAME`
4. Name: `em` (or full host from result)
5. Target: (value from result)
6. Proxy status: DNS only (gray cloud)
7. Repeat for all 3 records

## Step 3: Verify Domain

Wait 15-60 minutes for DNS propagation, then:

```typescript
const status = await client.verifyDomain();

if (status.verified) {
  console.log("Domain verified!");
} else {
  console.log("Not yet verified. Check DNS records.");
}
```

## Step 4: Send from Custom Domain

Once your domain is verified, you can send emails from your custom domain using the `em.` subdomain prefix.

### Allowed From Addresses

After verification, you can use:

```typescript
await client.sendEmail({
  from: "support@em.yourdomain.com",
  to: "user@example.com",
  subject: "Hello",
  body: "Sent from custom domain!",
});
```

### Important Rules

:::warning Domain Format Requirements

- **Use `em.yourdomain.com`** - Not your root domain
- If verified domain is `example.com`, use `anything@em.example.com`
- Examples: `support@em.example.com`, `noreply@em.example.com`
  :::

### Automatic From Address Selection

If you don't specify a `from` address, NotifyHub automatically chooses:

| Scenario           | From Address                      |
| ------------------ | --------------------------------- |
| Domain verified    | `noreply@em.yourdomain.com`       |
| No domain verified | `noreply@notifyhub.com` (default) |

**Examples:**

```typescript
// Without verified domain - uses default
await client.sendEmail({
  to: "user@example.com",
  subject: "Test",
  body: "Hello",
  // Sends from: noreply@notifyhub.com
});

// With verified domain (yourdomain.com) - uses custom domain
await client.sendEmail({
  to: "user@example.com",
  subject: "Test",
  body: "Hello",
  // Sends from: noreply@em.yourdomain.com
});

// Custom sender with em. subdomain
await client.sendEmail({
  from: "support@em.yourdomain.com",
  to: "user@example.com",
  subject: "Support Ticket",
  body: "We received your request",
});
```

### Common Errors

**Using root domain instead of em. subdomain:**

```typescript
await client.sendEmail({
  from: "support@yourdomain.com",
  to: "user@example.com",
  subject: "Test",
  body: "Won't work",
});
// Error: Cannot send from support@yourdomain.com.
// Use em.yourdomain.com instead (e.g., support@em.yourdomain.com)
```

**Domain not verified:**

```typescript
await client.sendEmail({
  from: "noreply@em.yourdomain.com",
  to: "user@example.com",
  subject: "Test",
  body: "Won't work",
});
// Error: Cannot send from noreply@em.yourdomain.com.
// Domain yourdomain.com is not verified.
```

**Using unauthorized NotifyHub addresses:**

```typescript
await client.sendEmail({
  from: "custom@notifyhub.com",
  to: "user@example.com",
  subject: "Test",
  body: "Won't work",
});
// Error: Cannot send from custom@notifyhub.com.
// Only noreply@notifyhub.com is allowed for NotifyHub domain.
```

### Best Practices

1. Always use the `em.` subdomain for custom domains
2. Only specify `from` when you need a specific sender address like `support@em.yourdomain.com`
3. Verify your domain first before attempting to send from custom addresses

## Troubleshooting

### Domain Not Verifying?

- Wait longer (DNS can take up to 24 hours)
- Check CNAME records are correct
- Use `dig` to verify DNS:

```bash
dig CNAME em.yourdomain.com
```

## Remove Domain

:::info
You can only have one verified domain at a time. Removing your current domain allows you to verify a different one.
:::

```typescript
await client.removeDomain();
console.log("Domain removed successfully");
```

## Next Steps

- [Send Email](/docs/api-reference/send-email)
- [Email Templates](/docs/examples/email-templates)
