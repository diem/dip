import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import isInternalUrl from '@docusaurus/isInternalUrl';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export const BUTTON_TYPES = {
  DEFAULT: 'default',
  CTA: 'cta',
}

const NavLink = ({ label, to, type }) => {
  const href = isInternalUrl(to) ? useBaseUrl(to) : to;

  return (
    <li className={classNames(
      styles.root,
      styles[type],
      {[styles.active]: isInternalUrl(href)},
    )}>
      <a href={href}>{label}</a>
    </li>
  );
};

NavLink.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(BUTTON_TYPES)),
  to: PropTypes.string.isRequired,
}

NavLink.defaultProps = {
  type: BUTTON_TYPES.DEFAULT,
}

export default NavLink;
