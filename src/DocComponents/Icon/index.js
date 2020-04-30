import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

export const TYPES = {
  'INLINE_START': 'inline-start',
  'DEFAULT': 'defalt',
};

const Icon = ({src, type}) => (
  <img 
    className={styles[type]}
    src={src}
  />
);

Icon.propTypes = {
  type: PropTypes.oneOf(Object.values(TYPES)),
  src: PropTypes.string.isRequired,
};

Icon.defaultProps = {
  type: TYPES.DEFAULT,
};

export default Icon;
