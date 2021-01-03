const darkCodeTheme = require("prism-react-renderer/themes/palenight");
const lightCodeTheme = require("prism-react-renderer/themes/github");
const objectAssignDeep = require('object-assign-deep');
const universalConfig = require('libra-docusaurus-components/src/universal-config');

module.exports = objectAssignDeep(universalConfig, {
  title: 'Diem Improvement Proposals',
  tagline: 'Diem Improvement Proposals',
  onBrokenLinks: 'ignore',
  url: 'https://dip.diem.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'diem',
  projectName: 'dip',
  themeConfig: {
    algolia: {
      apiKey: '4358e9ae3fbcd8b296ea863bd8cd9456',
      indexName: 'diem_improvement_proposals',
    },
    prism: {
      darkTheme: darkCodeTheme,
      theme: lightCodeTheme,
    },
    sidebarCollapsible: false,
    siteID: 'dips',
  },
  plugins: [
    require.resolve('./plugins/alias/src'),
    require.resolve('./plugins/dip-metadata/src'),
    require.resolve('./plugins/react-axe-ada-monitoring'),
    require.resolve('./plugins/seo-tags'),
    require.resolve('libra-docusaurus-components/src/plugin-segment'),
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/diem/dip/edit/master/',
          path: 'all-docs__GENERATED',
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  customFields: {
    navbar: {
      title: 'Governance',
    },
    segment: {
      productionKey: 'g7EJ7IBwqVHMlcE7LsibZgNyMVyZHRXU',
      stagingKey: '4o1O3LLd7EvFJ2Cp3CbFfXk3yy8LeT5t',
    },
    trackingCookieConsent: 'diem-dips-cookies-allowed',
    trackingCookieExpiration: 90, // in days
  },
});
