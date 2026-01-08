---
sidebar_position: 1
---

# Installation

Get started with NotifyHub in minutes.

### Sign Up

1. Visit [notifyhub.com](https://notifyhub.com)
2. Create an account
3. Get your API key from the dashboard

### Install SDK

#### npm

```bash
npm install @notifyhub/sdk
```

#### yarn

```bash
yarn add @notifyhub/sdk
```

#### pnpm

```bash
pnpm add @notifyhub/sdk
```

### Requirements

- Node.js 18 or higher
- TypeScript 5.0+ (optional but recommended)

### Verify Installation

Create a test file:

```typescript
import { NotifyHubClient } from "@notifyhub/sdk";

const client = new NotifyHubClient({
  apiKey: "your-api-key",
});

const pong = await client.ping();
console.log(pong); // {message: 'pong'}
```

### Next Steps

- [Quick Start Guide](/docs/getting-started/quickstart)
- [Authentication](/docs/api-reference/authentication)
