---
sidebar_position: 1
---

# Installation

Get started with NotifyKit in minutes.

### Sign Up

1. Visit [notifykit.dev](https://notifykit.dev)
2. Create an account
3. Get your API key from the dashboard

### Install SDK

#### npm

```bash
npm install @notifykit/sdk
```

#### yarn

```bash
yarn add @notifykit/sdk
```

#### pnpm

```bash
pnpm add @notifykit/sdk
```

### Requirements

- Node.js 18 or higher
- TypeScript 5.0+ (optional but recommended)

### Verify Installation

Create a test file:

```typescript
import { NotifyKitClient } from "@notifykit/sdk";

const client = new NotifyKitClient({
  apiKey: "your-api-key",
});

const pong = await client.ping();
console.log(pong); //'pong'
```

### Next Steps

- [Quick Start Guide](/docs/getting-started/quickstart)
- [Authentication](/docs/api-reference/authentication)
