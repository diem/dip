const globalClass = className => ({
  global: true,
  name: className,
});

const backToHome = {
  extra: {
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
      extra: {
        classNames: ['home', globalClass('home'), globalClass('main-sidebar-icon')],
        icon: 'img/overview.png',
        iconDark: 'img/overview-dark.png',
      },
    },
    {
      label: 'DIPS',
      extra: {
        classNames: [globalClass('dip-category')],
      },
      items: [
        {
          type: 'ref',
          id: 'all-dips',
          extra: {
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
          extra: {
            classNames: [globalClass('main-sidebar-icon')],
            icon: 'img/standard-dips.svg',
            iconDark: 'img/standard-dips-dark.png',
          },
        },
        {
          type: 'ref',
          id: 'process-dips',
          extra: {
            classNames: [globalClass('main-sidebar-icon'), globalClass('background-contain')],
            icon: 'img/process-dips.png',
            iconDark: 'img/process-dips-dark.png',
          },
        },
        {
          type: 'ref',
          id: 'info-dips',
          extra: {
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
      extra: {
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
      extra: {
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
      extra: {
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
      extra: {
        classNames: ['categoryLabel'],
        icon: 'img/process-dips.png',
        iconDark: 'img/process-dips-dark.png',
      },
    },
  ]
};
