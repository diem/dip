module.exports = {
  title: 'Libra Improvement Proposals',
  tagline: 'Libra Improvement Proposals',
  url: 'https://lip.libra.org',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'libra',
  projectName: 'lip',
  themeConfig: {
    algolia: {
      apiKey: '410fb6151a3f329a286b9cb0fad63330',
      indexName: 'libra-lips',
    },
    sidebarCollapsible: false,
    siteID: 'lips',
    navbar: {
      title: 'Governance',
    },
  },
  plugins: [
    require.resolve('./plugins/alias/src'),
    require.resolve('./plugins/lip-metadata/src'),
    require.resolve('./plugins/react-axe-ada-monitoring'), 
  ],
  presets: [
    [
      require.resolve('./temp-preset'),
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/libra/lip/edit/master/',
          path: 'all-docs__GENERATED',
          routeBasePath: '',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
