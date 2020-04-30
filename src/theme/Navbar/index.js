import React, {Component, useState} from 'react';
import { BreakpointProvider, setDefaultBreakpoints } from 'react-socks';

import PrimaryNav from './PrimaryNav';
import SubNav from './SubNav';

import Variables from 'CSS/variables.module.css';
import styles from './styles.module.css';

setDefaultBreakpoints([
  { small: parseInt(Variables['small-mobile-breakpoint-size']) },
  { medium: parseInt(Variables['medium-tablet-breakpoint-size']) },
  { large: parseInt(Variables['large-tablet-breakpoint-size']) },
  { xlarge: parseInt(Variables['larget-desktop-breakpoint-size']) }
]);

const Navbar = () => {
  const [activePopupMenu, setActivePopupMenu] = useState(null);

  const setPopupMenu = activePopupMenu => {
    setActivePopupMenu(activePopupMenu);

    if (activePopupMenu !== null) {
      document.querySelector('body').addEventListener('click', function() {
        setActivePopupMenu(null);
      }, { once: true });
    }
  };

  return (
    <BreakpointProvider>
      <nav className={styles.root}>
        <PrimaryNav activePopupMenu={activePopupMenu} setPopupMenu={setPopupMenu} />
        <SubNav activePopupMenu={activePopupMenu} setPopupMenu={setPopupMenu} />
      </nav>
    </BreakpointProvider>
  );
};

export default Navbar;
