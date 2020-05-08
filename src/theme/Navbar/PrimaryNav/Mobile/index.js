import React from 'react';
import PropTypes from 'prop-types';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import PopupMenu from '../../components/PopupMenu';
import NavMenuIcon from '../../components/NavMenuIcon';
import NavLink from '../../components/NavLink';
import styles from './styles.module.css';
import navStyles from '../../styles.module.css';

const PrimaryMobile = ({ activePopupMenu, setPopupMenu } ) => {
  const { siteConfig: { themeConfig } } = useDocusaurusContext();
  const { navbar } = themeConfig;
  const { cornerLink, primaryLinks, logo } = navbar;

  return (
    <div className={styles.root}>
      <div className={styles.mainContainer}>
        <NavMenuIcon
          cb={() => {setPopupMenu('primary')}}
          closeIcon={useBaseUrl('img/close.svg')}
          isOpen={activePopupMenu === 'primary'}
          openIcon={useBaseUrl('img/vertical-ellipse.svg')}
        />

        <a href={logo.href}>
          <img 
            alt={logo.alt} 
            className={navStyles.logo}
            src={useBaseUrl(logo.src)} 
          />
        </a>
        <a href={cornerLink.href}>
          <img src={useBaseUrl(cornerLink.image.src)} />
        </a>
      </div>
      {activePopupMenu === 'primary' && 
        <PopupMenu links={primaryLinks} />
      }
    </div>
  );
};

PrimaryMobile.propTypes = {
  activePopupMenu: PropTypes.string,
  setPopupMenu: PropTypes.func.isRequired,
};

export default PrimaryMobile;
