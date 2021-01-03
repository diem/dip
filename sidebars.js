const globalClass = className => ({
  global: true,
  name: className,
});

const backToHome = {
  customProps: {
    classNames: ['backToHome', globalClass('back-to-home')],
    icon: 'img/shared/arrow-left.svg',
    iconHover: 'img/shared/arrow-left-hover.svg',
    iconDarkHover: 'img/shared/arrow-left-dark-hover.svg',
  },
  href: '/overview',
  label: 'Overview',
  type: 'link',
};

module.exports = {
  main: [
    {
      type: 'doc',
      id: 'overview',
      customProps: {
        classNames: ['home', globalClass('home'), globalClass('main-sidebar-icon')],
        icon: 'img/overview.png',
        iconDark: 'img/overview-dark.png',
      },
    },
    {
      label: 'DIPS',
      customProps: {
        classNames: [globalClass('dip-category')],
      },
      items: [
        {
          type: 'ref',
          id: 'all-dips',
          customProps: {
            classNames: [
              globalClass('main-sidebar-icon'),
              globalClass('background-contain'),
              globalClass('main-sidebar-all-dips')
            ],
            icon: 'img/all-dips.png',
            iconDark: 'img/all-dips-dark.png',
          },
        },
        {
          type: 'ref',
          id: 'standard-dips',
          customProps: {
            classNames: [globalClass('main-sidebar-icon')],
            icon: 'img/standard-dips.svg',
            iconDark: 'img/standard-dips-dark.png',
          },
        },
        {
          type: 'ref',
          id: 'process-dips',
          customProps: {
            classNames: [globalClass('main-sidebar-icon'), globalClass('background-contain')],
            icon: 'img/process-dips.png',
            iconDark: 'img/process-dips-dark.png',
          },
        },
        {
          type: 'ref',
          id: 'info-dips',
          customProps: {
            classNames: [
              globalClass('main-sidebar-icon'),
              globalClass('dip-info-icon'),
            ],
            icon: 'img/info-dips.svg',
            iconDark: 'img/info-dips-dark.svg',
          },
        },
      ],
      type: 'category',
    }
  ],
  allDips: [
    backToHome,
    {
      type: 'doc',
      id: 'all-dips',
      customProps: {
        classNames: [
          'categoryLabel',
          globalClass('background-contain'),
        ],
        icon: 'img/all-dips.png',
        iconDark: 'img/all-dips-dark.png',
      },
    },
  ],
  standardDips: [
    backToHome,
    {
      type: 'doc',
      id: 'standard-dips',
      customProps: {
        classNames: ['categoryLabel', globalClass('icon-indented')],
        icon: 'img/standard-dips.svg',
        iconDark: 'img/standard-dips-dark.png',
      },
    },
  ],
  infoDips: [
    backToHome,
    {
      type: 'doc',
      id: 'info-dips',
      customProps: {
        classNames: ['categoryLabel',
          globalClass('icon-indented'),
          globalClass('dip-info-icon'),
        ],
        icon: 'img/info-dips.svg',
        iconDark: 'img/info-dips-dark.svg',
      },
    },
  ],
  processDips: [
    backToHome,
    {
      type: 'doc',
      id: 'process-dips',
      customProps: {
        classNames: ['categoryLabel'],
        icon: 'img/process-dips.png',
        iconDark: 'img/process-dips-dark.png',
      },
    },
  ]
};
