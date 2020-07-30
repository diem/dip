const path = require('path');

module.exports = function(context, options) {
  return {
    name: 'alias-plugin',
    configureWebpack(config, isServer, utils) {
      const {getCacheLoader} = utils;
      return {
        resolve: {
          alias: {
            CSS: path.resolve(__dirname, '../../../src/css'),
            components: path.resolve(__dirname, '../../../src/components'),
            react: path.resolve('./node_modules/react'),
            img: path.resolve(__dirname, '../../../static/img'),
            src: path.resolve(__dirname, '../../../src'),
          },
        },
        module: {
          rules: [
            {
              test: /\.svg$/,
              use: ['@svgr/webpack'],
            },
          ],
        },
      };
    },
  };
};
