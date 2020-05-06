module.exports = {
  title: 'Libra',
  tagline: 'A New Global Payment System',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'libra',
  projectName: 'libra',
  themeConfig: {
    disableDarkMode: true,
    algolia: {
      apiKey: '410fb6151a3f329a286b9cb0fad63330',
      indexName: 'libra-lips',
    },
    navbar: {
      title: 'My Site',
      logo: {
        alt: 'My Site Logo',
        src: 'img/libra-nav-logo.png',
        href: 'https://libra.org',
      },
      primaryLinks: [
        {
          label: 'Vision',
          to: 'https://libra-release.dfuzr.dev/en-US/vision/',
        },
        {
          label: 'Association',
          to: 'https://libra-release.dfuzr.dev/en-US/association/',
        },
        {
          label: 'Developers',
          to: 'https://libra-release.dfuzr.dev/en-US/open-source-developers/',
        },
        {
          label: 'Learn',
          to: 'https://libra-release.dfuzr.dev/en-US/learn-faqs/',
        },
        {
          label: 'Media',
          to: 'https://libra-release.dfuzr.dev/en-US/media-press-news/',
        },
      ],
      cornerLink: {
        label: 'White Paper',
        href: 'https://libra.org/white-paper/',
        image: {
          src: 'img/white-paper.svg',
          alt: '',
        }
      },
      secondaryLinks: [
        {
          label: 'Overview',
          to: 'https://libra.org/en-US/open-source-developers/',
        },
        {
          label: 'Libra Docs',
          to: 'https://developers.libra.org/docs/welcome-to-libra',
        },
        {
          label: 'Community',
          to: 'https://community.libra.org/c/member-portal',
        },
        {
          label: 'Governance',
          to: '/',
        },
        {
          isExternal: true,
          label: 'Github',
          to: 'https://github.com/libra/libra',
        }
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        src: 'img/footer-logo.png',
        href: 'https://libra.org',
      },
      links: [
        {
          title: 'Learn About Libra',
          items: [
            {
              label: 'Welcome to Libra',
              to: 'https://developers.libra.org/docs/welcome-to-libra',
            },
            {
              label: 'Libra Protocol',
              to: 'https://developers.libra.org/docs/libra-protocol',
            },
            {
              label: 'Libra Blockchain',
              to: 'https://developers.libra.org/docs/the-libra-blockchain-paper',
            },
            {
              label: 'Life of a Transaction',
              to: 'https://developers.libra.org/docs/life-of-a-transaction',
            },
          ],
        },
        {
          title: 'Try Libra Core',
          items: [
            {
              label: 'My First Transaction',
              href: 'https://developers.libra.org/docs/my-first-transaction',
            },
            {
              label: 'Getting Started With Move',
              href: 'https://developers.libra.org/docs/move-overview',
            },
          ],
        },
        {
          title: 'Policies',
          items: [
            {
              label: 'Privacy Policy',
              href: 'https://developers.libra.org/docs/policies/privacy-policy',
            },
            {
              label: 'Terms of Use',
              href: 'https://developers.libra.org/docs/policies/terms-of-use',
            },
            {
              label: 'Cookies Policy',
              href: 'https://developers.libra.org/docs/policies/cookies-policy',
            },
            {
              label: 'Code of Conduct',
              href: 'https://developers.libra.org/docs/policies/code-of-conduct',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Developer Forum',
              href: 'https://community.libra.org/',
            },
            {
              label: 'Newsletter',
              href: 'https://developers.libra.org/newsletter_form',
            },
          ],
        },
      ],
      social: {
        twitterHandle: 'libradev',
        githubRepo: 'https://github.com/libra/libra',
      },
      copyright: `© Libra Association`,
    },
    sidebarCollapsible: false,
  },
  plugins: [
    require.resolve('./plugins/alias/src'), 
    require.resolve('./plugins/lip-metadata/src'),
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/dfuzr/libra-lips/edit/master/',
          path: 'all-docs__GENERATED',
          routeBasePath: '',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-classic', '@docusaurus/theme-search-algolia'],
};
