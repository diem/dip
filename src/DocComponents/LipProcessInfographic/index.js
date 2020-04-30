import React from 'react';
import styles from './styles.module.css';

const LipProcessInfographic = ({stages}) => (
  <div className={styles.root}>
    <div className={styles.stagesContainer}>
      {stages.map((stage, i) => 
        <>
          <div className={styles.stage}>
            <span className={styles.counter}>0{i+1}</span>
            <span className={styles.stageName}>{stage}</span>
          </div>
          {i + 1 !== stages.length && 
            <hr className={styles.divider} />
          }
        </>
      )}
    </div>
  </div>
);

export default LipProcessInfographic;
