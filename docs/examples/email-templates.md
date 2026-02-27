---
sidebar_position: 1
---

# Email Templates

Common email template patterns.

## Welcome Email

```typescript
async function sendWelcomeEmail(user: User) {
  await client.sendEmail({
    to: user.email,
    subject: "Welcome to NotifyKit!",
    body: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h1>Welcome ${user.name}!</h1>
        <p>Thanks for signing up. Get started by sending your first notification.</p>
        <a href="https://notifykit.dev/docs"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Documentation
        </a>
      </div>
    `,
  });
}
```

## Password Reset

```typescript
async function sendPasswordReset(user: User, resetToken: string) {
  const resetUrl = `https://yourapp.com/reset?token=${resetToken}`;

  await client.sendEmail({
    to: user.email,
    subject: "Reset Your Password",
    body: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}
```

## Order Confirmation

```typescript
async function sendOrderConfirmation(order: Order) {
  await client.sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmation #${order.id}`,
    body: `
      <h1>Thank you for your order!</h1>
      <p>Order #${order.id} has been confirmed.</p>

      <h3>Items:</h3>
      <ul>
        ${order.items
          .map(
            (item) => `
          <li>${item.name} x${item.quantity} - $${item.price}</li>
        `
          )
          .join("")}
      </ul>

      <p><strong>Total: $${order.total}</strong></p>
      <p>Estimated delivery: ${order.estimatedDelivery}</p>
    `,
  });
}
```

## Newsletter

```typescript
async function sendNewsletter(subscribers: string[], content: string) {
  // Send to multiple recipients
  const jobs = await Promise.all(
    subscribers.map((email) =>
      client.sendEmail({
        to: email,
        subject: "Monthly Newsletter - January 2026",
        body: content,
      })
    )
  );

  console.log(`Sent ${jobs.length} newsletters`);
}
```
