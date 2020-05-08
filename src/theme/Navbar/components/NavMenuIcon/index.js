import React, {useEffect, useRef} from 'react';
import styles from './styles.module.css';

const NavMenuIcon = ({ cb, closeIcon, isOpen, openIcon }) => {
  let iconRef;
  const isOpenRef = useRef(null);
  isOpenRef.current = isOpen;

  useEffect(() => {
    iconRef.addEventListener('click', e => {
      if (!isOpenRef.current) {
        e.stopPropagation();
        cb();
      }
    });
  }, []);

  return (
    <img
      className={styles.root}
      ref={el => iconRef = el}
      src={isOpen ? closeIcon : openIcon}
    />
  );
};

export default NavMenuIcon;
