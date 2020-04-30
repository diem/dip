import React from 'react';
import PropTypes from 'prop-types';
import { Breakpoint } from 'react-socks';
import Desktop from './Desktop';
import Mobile from './Mobile';
import styles from './styles.module.css';

const Subnav = ({activePopupMenu, setPopupMenu}) => (
  <div className={styles.root}>
    <Breakpoint medium down>
      <Mobile activePopupMenu={activePopupMenu} setPopupMenu={setPopupMenu} />
    </Breakpoint>
    <Breakpoint large up>
      <Desktop />
    </Breakpoint>
  </div>
);

Subnav.propTypes = {
  activePopupMenu: PropTypes.string,
  setPopupMenu: PropTypes.func.isRequired,
};

export default Subnav;
