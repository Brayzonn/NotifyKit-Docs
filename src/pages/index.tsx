import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

export default function Home() {
  return (
    <Layout
      title="NotifyHub Documentation"
      description="Simple notification infrastructure for developers"
    >
      <main>
        <div className="hero hero--primary">
          <div className="container">
            <h1 className="hero__title">NotifyHub Documentation</h1>
            <p className="hero__subtitle">
              Simple, affordable notification infrastructure for developers
            </p>
            <div style={{ marginTop: "2rem" }}>
              <Link
                className="button button--primary button--lg"
                to="/docs/introduction"
              >
                Get Started →
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/api-reference/authentication"
                style={{ marginLeft: "1rem" }}
              >
                API Reference
              </Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: "4rem 0" }}>
          <div className="row">
            <div className="col col--4">
              <h3>Easy to Use</h3>
              <p>
                Get started in minutes with our simple SDK and clear
                documentation.
              </p>
            </div>
            <div className="col col--4">
              <h3>Fast & Reliable</h3>
              <p>Built on Bull queues with automatic retries and monitoring.</p>
            </div>
            <div className="col col--4">
              <h3>Affordable</h3>
              <p>Simple pricing starting at $9/month. No hidden fees.</p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
