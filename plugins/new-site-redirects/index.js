module.exports = function (context, options) {
  return {
    name: 'new-site-redirects',
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              charset: 'utf-8',
              src: '/scripts/new-site-redirects.js',
            },
          },
        ],
      };
    },
  };
};
