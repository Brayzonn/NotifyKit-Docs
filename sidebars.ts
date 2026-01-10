import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "introduction",
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: ["getting-started/installation", "getting-started/quickstart"],
    },
    {
      type: "category",
      label: "API Reference",
      collapsed: false,
      items: [
        "api-reference/authentication",
        "api-reference/send-email",
        "api-reference/send-webhook",
        "api-reference/jobs",
      ],
    },
    {
      type: "category",
      label: " SDK",
      items: ["sdk/typescript"],
    },
    {
      type: "category",
      label: "Guides",
      items: ["guides/domain-verification"],
    },
    {
      type: "category",
      label: "Examples",
      items: ["examples/email-templates"],
    },
  ],
};

export default sidebars;
