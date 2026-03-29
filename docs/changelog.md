---
sidebar_position: 99
---

# Changelog

All notable changes to the NotifyKit API and platform.

---

## 2026-03-29

### Multi-provider email support

NotifyKit now supports **SendGrid** and **Resend** as email providers, with automatic failover between them.

**What's new:**

- Connect a Resend API key alongside (or instead of) SendGrid in **Settings → Email Providers**
- Each provider gets its own sending domain registration and DNS records
- Providers are tried in priority order — if one fails (expired key, rate limit, outage), the next configured provider is used automatically on the same attempt
- Free plan: NotifyKit's shared infrastructure now uses both SendGrid and Resend as platform-level providers with automatic failover
- Domain verification now registers with all configured providers simultaneously — DNS records for each provider are shown in the dashboard

**Breaking changes:** None. Existing SendGrid-only configurations continue to work without any changes.

---

## Earlier

Initial release with:

- Transactional email via SendGrid (BYOK on paid plans, shared infrastructure on Free)
- Webhook delivery with automatic retries and exponential backoff
- Idempotent job submission
- Per-plan rate limiting and monthly quotas
- Custom sender domain verification (SendGrid)
- Delivery logs with per-attempt status tracking
- Job retry via dashboard and API
- GitHub OAuth
- Stripe and Paystack billing
