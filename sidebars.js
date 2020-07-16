const globalClass = className => ({
  global: true,
  name: className,
});

const backToHome = {
  extra: {
    classNames: ['backToHome', globalClass('lip-back-to-home')],
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
        classNames: ['home', globalClass('lip-main-sidebar-icon')],
        icon: 'img/overview.svg',
        iconDark: 'img/overview-dark.svg',
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
            classNames: [globalClass('lip-main-sidebar-icon')],
            icon: 'img/all-lips.svg',
            iconDark: 'img/all-lips-dark.svg',
          },
        },
        {
          type: 'ref',
          id: 'standard-lips',
          extra: {
            classNames: [globalClass('lip-main-sidebar-icon')],
            icon: 'img/standard-lips.svg',
            iconDark: 'img/standard-lips-dark.svg',
          },
        },
        {
          type: 'ref',
          id: 'process-lips',
          extra: {
            classNames: [globalClass('lip-main-sidebar-icon')],
            icon: 'img/process-lips.svg',
            iconDark: 'img/process-lips-dark.svg',
          },
        },
        {
          type: 'ref',
          id: 'info-lips',
          extra: {
            classNames: [
              globalClass('lip-main-sidebar-icon'),
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
        classNames: ['categoryLabel', globalClass('icon-indented')],
        icon: 'img/all-lips.svg',
        iconDark: 'img/all-lips-dark.svg',
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
        iconDark: 'img/standard-lips-dark.svg',
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
        classNames: ['categoryLabel', globalClass('icon-indented')],
        icon: 'img/process-lips.svg',
        iconDark: 'img/process-lips-dark.svg',
      },
    },
  ]
};
