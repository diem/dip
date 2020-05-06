import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import NavLink, { BUTTON_TYPES } from '../../components/NavLink';
import styles from './styles.module.css';
import navStyles from '../../styles.module.css';

const PrimaryDesktop = () => {
  const { siteConfig: { themeConfig } } = useDocusaurusContext();
  const { navbar } = themeConfig;
  const { cornerLink, primaryLinks, logo } = navbar;

  return (
    <div className={styles.root}>
      <a href={logo.href}>
        <img 
          alt={logo.alt} 
          className={navStyles.logo}
          src={useBaseUrl(logo.src)} 
        />
      </a>
      <ul className={styles.right}>
        {primaryLinks.map(({isExternal, label, to}) =>
          <NavLink 
            key={label}
            isExternal={isExternal}
            label={label}
            to={to}
          />
        )}
        <NavLink
          className={styles['corner-link']}
          label={cornerLink.label}
          to={cornerLink.href}
          type={BUTTON_TYPES.CTA}
        />
      </ul>
    </div>
  );
}

export default PrimaryDesktop
