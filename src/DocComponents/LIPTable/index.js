import React from 'react';
import PropTypes from 'prop-types';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import filesByType from '../../../LIPMetadata.json';
import {LIP_TYPE, LIP_STATUS} from '../../enums';
import {parseAuthors} from 'src/utils';

import styles from './styles.module.css';

const getLips = (status, types) =>
  types.reduce((lips, type) => {
    return lips.concat(filesByType[type][status]);
  }, []).sort((a, b) => a.lip < b.lip ? 1 : -1);

const Author = ({index, title, username}) => {
  const formattedTitle = `${index > 0 ? ', ' : ''}${title}`;

  if (!username) {
    return formattedTitle;
  }

  return (
    <a
      href={`https://github.com/${username}`}
      target="_blank"
    >
      {formattedTitle}
    </a>
  );
};

const LIPRow = ({ authors, num, title }) => {
  const {siteConfig: {themeConfig}} = useDocusaurusContext();
  const parsedAuthors = parseAuthors(authors);

  return (
    <tr>
      <td>
        <a href={useBaseUrl(`/lip-${num}`)}>
          {num}
        </a>
      </td>
      <td>{title}</td>
      <td>
        {parsedAuthors.map(({title, username}, i) =>
          <Author index={i} title={title} username={username} />
        )}
      </td>
    </tr>
  );
};

const LIPTable = ({status, title, types}) => {
  const lips = getLips(status, types);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Number</th>
          <th className={styles.title}>Title</th>
          <th>Author(s)</th>
        </tr>
      </thead>
      <tbody>
        {lips.map(({lip: num, authors, title}) =>
          <LIPRow
            authors={authors}
            key={num}
            num={num}
            title={title}
          />
        )}
      </tbody>
    </table>
  );
};

LIPTable.propTypes = {
  status: PropTypes.oneOf(Object.values(LIP_STATUS)).isRequired,
  types: PropTypes.arrayOf(PropTypes.oneOf(Object.values(LIP_TYPE))),
};

LIPTable.defaultProps = {
  types: Object.values(LIP_TYPE),
};

export default LIPTable;
