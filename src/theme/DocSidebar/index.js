import React, {useState, useCallback} from 'react';
import classnames from 'classnames';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useLockBodyScroll from '@theme/hooks/useLockBodyScroll';
import useLogo from '@theme/hooks/useLogo';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';

import styles from './styles.module.css';

const MOBILE_TOGGLE_SIZE = 24;

function DocSidebarItem({item, onItemClick, collapsible, isRoot = false}) {
  const {items, href, label, type} = item;
  const [collapsed, setCollapsed] = useState(item.collapsed);
  const [prevCollapsedProp, setPreviousCollapsedProp] = useState(null);

  // If the collapsing state from props changed, probably a navigation event
  // occurred. Overwrite the component's collapsed state with the props'
  // collapsed value.
  if (item.collapsed !== prevCollapsedProp) {
    setPreviousCollapsedProp(item.collapsed);
    setCollapsed(item.collapsed);
  }

  const handleItemClick = useCallback(e => {
    e.preventDefault();
    setCollapsed(state => !state);
  });

  switch (type) {
    case 'category':
      return (
        items.length > 0 && (
          <li
            className={classnames('menu__list-item', styles.category, {
              'menu__list-item--collapsed': collapsed,
            })}
            key={label}>

            {label.toLowerCase() === 'all lips' ?
              /* 
               * This is a hack. Docusaurus currently does not want to
               * support clickable categories. 
               * See https://docusaurus-2.netlify.com/feedback/p/option-to-make-categories-clickable-links-to-docs-as-well-for-overview-introduct
               */
              <Link
                className="menu__link"
                to="/all-lips"
                {...(isInternalUrl(href)
                  ? {
                      activeClassName: styles.active,
                      exact: true,
                      onClick: onItemClick,
                    }
                  : {
                      target: '_blank',
                      rel: 'noreferrer noopener',
                    })}>
                {label}
              </Link> :
              <a
                className="menu__link"
                href="#!"
                onClick={collapsible ? handleItemClick : undefined}>
                {label}
              </a>
            }
            <ul className="menu__list">
              {items.map(childItem => (
                <DocSidebarItem
                  key={childItem.label}
                  item={childItem}
                  onItemClick={onItemClick}
                  collapsible={collapsible}
                />
              ))}
            </ul>
          </li>
        )
      );

    case 'link':
    default:
      return (
        <li className="menu__list-item" key={label}>
          <Link
            className="menu__link"
            to={href}
            {...(isInternalUrl(href)
              ? {
                  activeClassName: styles.active,
                  exact: true,
                  onClick: onItemClick,
                }
              : {
                  target: '_blank',
                  rel: 'noreferrer noopener',
                })}>
            {label}
          </Link>
        </li>
      );
  }
}

// Calculate the category collapsing state when a page navigation occurs.
// We want to automatically expand the categories which contains the current page.
function mutateSidebarCollapsingState(item, path) {
  const {items, href, type} = item;
  switch (type) {
    case 'category': {
      const anyChildItemsActive =
        items
          .map(childItem => mutateSidebarCollapsingState(childItem, path))
          .filter(val => val).length > 0;
      // eslint-disable-next-line no-param-reassign
      item.collapsed = !anyChildItemsActive;
      return anyChildItemsActive;
    }

    case 'link':
    default:
      return href === path;
  }
}

function DocSidebar(props) {
  const [showResponsiveSidebar, setShowResponsiveSidebar] = useState(false);
  const {
    siteConfig: {
      themeConfig: {navbar: {title, hideOnScroll = false} = {}},
    } = {},
    isClient,
  } = useDocusaurusContext();
  const {logoLink, logoLinkProps, logoImageUrl, logoAlt} = useLogo();

  const {
    docsSidebars,
    path,
    sidebar: currentSidebar,
    sidebarCollapsible,
  } = props;

  useLockBodyScroll(showResponsiveSidebar);

  if (!currentSidebar) {
    return null;
  }

  const sidebarData = docsSidebars[currentSidebar];

  if (!sidebarData) {
    throw new Error(
      `Cannot find the sidebar "${currentSidebar}" in the sidebar config!`,
    );
  }

  if (sidebarCollapsible) {
    sidebarData.forEach(sidebarItem =>
      mutateSidebarCollapsingState(sidebarItem, path),
    );
  }

  return (
    <div className={styles.sidebar}>
      {hideOnScroll && (
        <Link className={styles.sidebarLogo} to={logoLink} {...logoLinkProps}>
          {logoImageUrl != null && (
            <img key={isClient} src={logoImageUrl} alt={logoAlt} />
          )}
          {title != null && <strong>{title}</strong>}
        </Link>
      )}
      <div
        className={classnames('menu', 'menu--responsive', styles.menu, {
          'menu--show': showResponsiveSidebar,
        })}>
        <button
          aria-label={showResponsiveSidebar ? 'Close Menu' : 'Open Menu'}
          aria-haspopup="true"
          className="button button--secondary button--sm menu__button"
          type="button"
          onClick={() => {
            setShowResponsiveSidebar(!showResponsiveSidebar);
          }}>
          {showResponsiveSidebar ? (
            <span
              className={classnames(
                styles.sidebarMenuIcon,
                styles.sidebarMenuCloseIcon,
              )}>
              &times;
            </span>
          ) : (
            <svg
              aria-label="Menu"
              className={styles.sidebarMenuIcon}
              xmlns="http://www.w3.org/2000/svg"
              height={MOBILE_TOGGLE_SIZE}
              width={MOBILE_TOGGLE_SIZE}
              viewBox="0 0 32 32"
              role="img"
              focusable="false">
              <title>Menu</title>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeMiterlimit="10"
                strokeWidth="2"
                d="M4 7h22M4 15h22M4 23h22"
              />
            </svg>
          )}
        </button>
        <ul className="menu__list">
          {sidebarData.map(item => (
            <DocSidebarItem
              key={item.label}
              item={item}
              onItemClick={() => {
                setShowResponsiveSidebar(false);
              }}
              collapsible={sidebarCollapsible}
              isRoot
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DocSidebar;
