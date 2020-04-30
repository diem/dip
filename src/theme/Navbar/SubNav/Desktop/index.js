import React, {useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SearchBar from '@theme/SearchBar';
import NavLink from '../../components/NavLink';
import PageIndicator from '../../components/PageIndicator';
import styles from './styles.module.css';

const SubnavDesktop = () => {
  const { siteConfig: { themeConfig } } = useDocusaurusContext();
  const [isSearchBarExpanded, setIsSearchBarExpanded] = useState(false);
  const {navbar} = themeConfig;
  const {secondaryLinks} = navbar;

  return (
    <div className={styles.root}>
      <PageIndicator />
      <div className={styles.right}>
        {secondaryLinks.map(({label, to}) =>
          <NavLink 
            key={label}
            label={label}
            to={to}
          />
        )}
        <div className={styles.search}>
          <SearchBar
            handleSearchBarToggle={setIsSearchBarExpanded}
            isSearchBarExpanded={isSearchBarExpanded}
          />
        </div>
      </div>
    </div>
  );
};

export default SubnavDesktop;
