import React from 'react';
import PropTypes from 'prop-types';
import { Breakpoint } from 'react-socks';
import Desktop from './Desktop';
import Mobile from './Mobile';
import styles from './styles.module.css';

const PrimaryNav = ({ activePopupMenu, setPopupMenu }) => (
  <div className={styles.root}>
    <div className="width-wrapper"> 
      <Breakpoint medium down>
        <Mobile 
          activePopupMenu={activePopupMenu} 
          setPopupMenu={setPopupMenu} 
        />
      </Breakpoint>
      <Breakpoint large up>
        <Desktop />
      </Breakpoint>
    </div>
  </div>
);

PrimaryNav.propTypes = {
  activePopupMenu: PropTypes.string,
  setPopupMenu: PropTypes.func.isRequired,
};

export default PrimaryNav;
