import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "NotifyKit",
  tagline: "Simple notification infrastructure for developers",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://docs.notifykit.dev",
  baseUrl: "/",

  organizationName: "notifykit",
  projectName: "notifykit-docs",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "docs",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/notifykit-social-card.jpg",
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "NotifyKit",

      items: [
        {
          label: "REST API",
          to: "/docs/api-reference/authentication",
          position: "left",
        },
        {
          label: "SDKs",
          to: "/docs/sdk/typescript",
          position: "left",
        },
        {
          href: "https://notifykit.dev",
          label: "Dashboard",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/docs/getting-started/installation",
            },
            {
              label: "API Reference",
              to: "/docs/api-reference/authentication",
            },
            {
              label: "Examples",
              to: "/docs/examples/email-templates",
            },
          ],
        },
        {
          title: "Product",
          items: [
            {
              label: "Dashboard",
              href: "https://notifykit.dev",
            },
            {
              label: "Pricing",
              href: "https://notifykit.dev/pricing",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/brayzonn/NotifyKit-Docs",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NotifyKit. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ["bash", "json"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
