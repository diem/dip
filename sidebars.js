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
      label: 'LIPS',
      extra: {
        classNames: [globalClass('lip-category')],
      },
      items: [
        {
          type: 'ref',
          id: 'all-lips',
          extra: {
            classNames: [
              globalClass('main-sidebar-icon'),
              globalClass('background-contain'),
              globalClass('main-sidebar-all-lips')
            ],
            icon: 'img/all-lips.png',
            iconDark: 'img/all-lips-dark.png',
          },
        },
        {
          type: 'ref',
          id: 'standard-lips',
          extra: {
            classNames: [globalClass('main-sidebar-icon')],
            icon: 'img/standard-lips.svg',
            iconDark: 'img/standard-lips-dark.png',
          },
        },
        {
          type: 'ref',
          id: 'process-lips',
          extra: {
            classNames: [globalClass('main-sidebar-icon'), globalClass('background-contain')],
            icon: 'img/process-lips.png',
            iconDark: 'img/process-lips-dark.png',
          },
        },
        {
          type: 'ref',
          id: 'info-lips',
          extra: {
            classNames: [
              globalClass('main-sidebar-icon'),
              globalClass('lip-info-icon'),
            ],
            icon: 'img/info-lips.svg',
            iconDark: 'img/info-lips-dark.svg',
          },
        },
      ],
      type: 'category',
    }
  ],
  allLips: [
    backToHome,
    {
      type: 'doc',
      id: 'all-lips',
      extra: {
        classNames: [
          'categoryLabel',
          globalClass('background-contain'),
        ],
        icon: 'img/all-lips.png',
        iconDark: 'img/all-lips-dark.png',
      },
    },
  ],
  standardLips: [
    backToHome,
    {
      type: 'doc',
      id: 'standard-lips',
      extra: {
        classNames: ['categoryLabel', globalClass('icon-indented')],
        icon: 'img/standard-lips.svg',
        iconDark: 'img/standard-lips-dark.png',
      },
    },
  ],
  infoLips: [
    backToHome,
    {
      type: 'doc',
      id: 'info-lips',
      extra: {
        classNames: ['categoryLabel',
          globalClass('icon-indented'),
          globalClass('lip-info-icon'),
        ],
        icon: 'img/info-lips.svg',
        iconDark: 'img/info-lips-dark.svg',
      },
    },
  ],
  processLips: [
    backToHome,
    {
      type: 'doc',
      id: 'process-lips',
      extra: {
        classNames: ['categoryLabel'],
        icon: 'img/process-lips.png',
        iconDark: 'img/process-lips-dark.png',
      },
    },
  ]
};
