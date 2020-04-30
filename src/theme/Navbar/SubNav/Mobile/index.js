import React, {useState} from 'react';
import PropTypes from 'prop-types';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SearchBar from '@theme/SearchBar';

import NavMenuIcon from '../../components/NavMenuIcon';
import PageIndicator from '../../components/PageIndicator';
import PopupMenu from '../../components/PopupMenu';
import styles from './styles.module.css';

const SubnavMobile = ({activePopupMenu, setPopupMenu}) => {
  const {siteConfig: {themeConfig}} = useDocusaurusContext();
  const [isSearchBarExpanded, setIsSearchBarExpanded] = useState(false);
  const {navbar} = themeConfig;
  const {cornerLink, secondaryLinks, logo} = navbar;

  return (
    <div>
      <div className={styles.mainContainer}>
        <PageIndicator />
        <NavMenuIcon
          cb={() => {setPopupMenu('secondary')}}
          closeIcon={useBaseUrl('img/chevron-pressed.svg')}
          isOpen={activePopupMenu === 'secondary'}
          openIcon={useBaseUrl('img/chevron-down.svg')}
        />
      </div>
      {activePopupMenu === 'secondary' && 
        <PopupMenu 
          links={secondaryLinks} 
          onClick={e => e.stopPropagation()}>
          <div className={styles.search}>
            <SearchBar
              handleSearchBarToggle={setIsSearchBarExpanded}
              isSearchBarExpanded={isSearchBarExpanded}
            />
          </div>
        </PopupMenu>
      }
    </div>
  );
};

SubnavMobile.propTypes = {
  activePopupMenu: PropTypes.string,
  setPopupMenu: PropTypes.func.isRequired,
};

export default SubnavMobile;
