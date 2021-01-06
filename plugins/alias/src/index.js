const path = require('path');

module.exports = function(context, options) {
  return {
    name: 'alias-plugin',
    configureWebpack(config, isServer, utils) {
      const { getCacheLoader } = utils;
      return {
        resolve: {
          alias: {
            CSS: path.resolve(__dirname, '../../../src/css'),
            components: path.resolve(__dirname, '../../../src/components'),
            'diem-docusaurus-components': path.resolve(
              __dirname,
              '../../../node_modules/@libra-opensource/diem-docusaurus-components',
            ),
            img: path.resolve(__dirname, '../../../static/img'),
            react: path.resolve('./node_modules/react'),
            src: path.resolve(__dirname, '../../../src'),
          },
        },
      };
    },
  };
};
