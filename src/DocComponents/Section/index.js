import React from 'react';

import styles from './styles.module.css';

const Section = ({ children }) => {
  return (
    <div className={styles.root}>
      {children}
      <span className={styles.community}>
        <a href="https://community.diem.com/">Ask the community</a> for support
      </span>
      <hr />
    </div>
  );
};

export default Section;
