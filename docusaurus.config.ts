import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "NotifyKit",
  tagline: "Simple notification infrastructure for developers",
  favicon: "favicon.ico",

  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "theme-color",
        content: "#ffffff",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "mobile-web-app-capable",
        content: "yes",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "apple-mobile-web-app-status-bar-style",
        content: "default",
      },
    },
  ],

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
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "NotifyKit",
      logo: {
        alt: "NotifyKit",
        src: "img/notifykit-logo.svg",
        srcDark: "img/notifykit-logo-dark.svg",
        width: 22,
        height: 28,
      },
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
