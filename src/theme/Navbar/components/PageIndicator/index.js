import React from 'react';
import styles from './styles.module.css';

const PageIndicator = () => (
  <div className={styles.root}>
    <span className={styles.primary}><b>Developers</b></span>
    <span className={styles.divider}> / </span>
    <span className={styles.secondary}>Governance</span>
  </div>
);

export default PageIndicator;
