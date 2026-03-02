import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

export default function Home() {
  return (
    <Layout
      title="NotifyKit Documentation"
      description="Simple notification infrastructure for developers"
    >
      <main className="landing-container">
        <div className="hero">
          <div className="container">
            <h1 className="hero__title">NotifyKit Documentation</h1>
            <p className="hero__subtitle">
              Simple, affordable notification infrastructure for developers
            </p>
            <div className="hero__buttons">
              <Link
                className="button button--primary button--lg"
                to="/docs/introduction"
              >
                Get Started →
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/api-reference/authentication"
              >
                API Reference
              </Link>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="container">
            <div className="row">
              <div className="col col--4">
                <div className="feature-card">
                  <h3>Easy to Use</h3>
                  <p>
                    Get started in minutes with our simple SDK and clear
                    documentation.
                  </p>
                </div>
              </div>
              <div className="col col--4">
                <div className="feature-card">
                  <h3>Fast & Reliable</h3>
                  <p>
                    Built on Bull queues with automatic retries and monitoring.
                  </p>
                </div>
              </div>
              <div className="col col--4">
                <div className="feature-card">
                  <h3>Affordable</h3>
                  <p>Simple pricing. No hidden fees.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
