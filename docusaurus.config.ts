import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "NotifyHub",
  tagline: "Simple notification infrastructure for developers",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://docs.notifyhub.com",
  baseUrl: "/",

  organizationName: "notifyhub",
  projectName: "notifyhub-docs",

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
    image: "img/notifyhub-social-card.jpg",
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "NotifyHub",

      items: [
        {
          label: "Docs",
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
        },
        {
          label: "API",
          to: "/docs/api-reference/authentication",
          position: "left",
        },
        {
          label: "SDKs",
          to: "/docs/sdk/typescript",
          position: "left",
        },
        {
          href: "https://notifyhub.com",
          label: "Dashboard",
          position: "right",
        },
        {
          href: "https://github.com/yourusername/notifyhub",
          label: "GitHub",
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
              href: "https://notifyhub.com",
            },
            {
              label: "Pricing",
              href: "https://notifyhub.com/pricing",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/yourusername/notifyhub",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/notifyhub",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NotifyHub. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "json"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
