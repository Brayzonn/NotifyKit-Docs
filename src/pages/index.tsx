import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

const NotifyKitIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M40 10 C25 10 15 20 15 35 L15 60 C15 65 10 72 3 78 L3 85 L77 85 L77 78 C70 72 65 65 65 60 L65 35 C65 20 55 10 40 10Z"
      fill="currentColor"
    />
    <circle cx="40" cy="95" r="5" fill="currentColor" />
    <circle cx="65" cy="20" r="12" fill="currentColor" />
    <circle cx="65" cy="20" r="8" fill="white" />
  </svg>
);

const GithubGlyph = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 1.95C17.525 1.95 22 6.426 22 11.95c0 2.096-.658 4.139-1.88 5.84-1.222 1.703-2.947 2.978-4.932 3.649-.5.1-.688-.213-.688-.476 0-.337.012-1.412.012-2.75 0-.937-.312-1.537-.675-1.85 2.225-.25 4.563-1.1 4.563-4.937 0-1.1-.388-1.988-1.025-2.688.1-.25.45-1.275-.1-2.65 0 0-.838-.275-2.75 1.025-.8-.225-1.65-.337-2.5-.337-.85 0-1.7.112-2.5.337-1.913-1.287-2.75-1.025-2.75-1.025-.55 1.375-.2 2.4-.1 2.65-.638.7-1.025 1.6-1.025 2.687 0 3.825 2.325 4.688 4.55 4.938-.288.25-.55.687-.638 1.337-.575.263-2.012.688-2.912-.825-.188-.3-.75-1.038-1.538-1.025-.837.013-.337.475.013.663.425.237.913 1.125 1.025 1.412.2.563.85 1.638 3.363 1.175 0 .838.012 1.625.012 1.863 0 .263-.187.563-.687.475C6.846 20.775 5.114 19.502 3.886 17.8 2.659 16.096 2 14.05 2 11.95 2 6.426 6.475 1.95 12 1.95Z" />
  </svg>
);

export default function Home() {
  return (
    <Layout
      title="NotifyKit Documentation"
      description="Documentation for NotifyKit — one API for all your email providers"
    >
      <main className="nk-landing">
        <section className="nk-hero">
          <div className="nk-hero__inner">
            <a
              href="https://github.com/Brayzonn/notifykit.git"
              target="_blank"
              rel="noopener noreferrer"
              className="nk-pill"
            >
              <GithubGlyph />
              <span>Open Source</span>
            </a>

            <h1 className="nk-hero__title">
              Everything
              <br />
              You Need To Build
              <br />
              With NotifyKit
            </h1>

            <p className="nk-hero__subtitle">
              The official documentation for the NotifyKit API and SDK. Send
              email and webhook notifications through SendGrid, Resend, or
              Postmark with one interface — automatic retries, failover, and
              unified delivery logs.
            </p>

            <div className="nk-hero__cta">
              <Link to="/docs/getting-started/quickstart" className="nk-btn nk-btn--primary">
                Get Started →
              </Link>
              <Link
                to="/docs/api-reference/authentication"
                className="nk-btn nk-btn--secondary"
              >
                API Reference
              </Link>
            </div>
          </div>
        </section>

        <section className="nk-features">
          <div className="nk-features__grid">
            <div className="nk-feature">
              <div className="nk-feature__icon">
                <NotifyKitIcon size={22} />
              </div>
              <h3>One API, three providers</h3>
              <p>
                SendGrid, Resend, and Postmark behind a single interface. Bring
                your own keys, set a priority order, and let NotifyKit fail over
                automatically.
              </p>
            </div>
            <div className="nk-feature">
              <div className="nk-feature__icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                  <polyline points="21 4 21 10 15 10" />
                </svg>
              </div>
              <h3>Retries & idempotency built in</h3>
              <p>
                Exponential backoff, automatic dead-letter handling, idempotency
                keys to prevent double-sends. Your code stays simple.
              </p>
            </div>
            <div className="nk-feature">
              <div className="nk-feature__icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3>Unified delivery logs</h3>
              <p>
                Every attempt across every provider, with the exact provider
                that delivered it. Audit, debug, and prove what shipped.
              </p>
            </div>
          </div>
        </section>

        <section className="nk-quicklinks">
          <h2 className="nk-quicklinks__title">Jump in</h2>
          <div className="nk-quicklinks__grid">
            <Link to="/docs/getting-started/quickstart" className="nk-link-card">
              <span className="nk-link-card__label">Quickstart</span>
              <span className="nk-link-card__hint">
                Send your first notification in under 5 minutes.
              </span>
            </Link>
            <Link to="/docs/api-reference/send-email" className="nk-link-card">
              <span className="nk-link-card__label">Send Email</span>
              <span className="nk-link-card__hint">
                Reference for the email send endpoint, including per-message
                provider routing.
              </span>
            </Link>
            <Link to="/docs/guides/domain-verification" className="nk-link-card">
              <span className="nk-link-card__label">Domain Verification</span>
              <span className="nk-link-card__hint">
                Verify a custom sender domain across all configured providers.
              </span>
            </Link>
            <Link to="/docs/sdk/typescript" className="nk-link-card">
              <span className="nk-link-card__label">TypeScript SDK</span>
              <span className="nk-link-card__hint">
                Full reference for the @notifykit/sdk client.
              </span>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
