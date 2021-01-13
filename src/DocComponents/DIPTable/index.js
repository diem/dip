import React from 'react';
import PropTypes from 'prop-types';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import Author from 'src/DocComponents/Author';
import filesByType from '../../../DIPMetadata.json';
import {DIP_TYPE, DIP_STATUS} from '../../enums';
import {parseAuthors} from 'src/utils';

import styles from './styles.module.css';

const getDips = (status, types) =>
  types.reduce((dips, type) => {
    return dips.concat(filesByType[type][status]);
  }, []).sort((a, b) => a.dip < b.dip ? 1 : -1);

const DIPRow = ({ authors, num, title }) => {
  const {siteConfig: {themeConfig}} = useDocusaurusContext();
  const parsedAuthors = parseAuthors(authors);

  return (
    <tr>
      <td className={styles.num}>{num}</td>
      <td><a href={useBaseUrl(`/dip-${num}`)}>{title}</a></td>
      <td>
        {parsedAuthors.map(({title, username}, i) =>
          <Author index={i} title={title} username={username} />
        )}
      </td>
    </tr>
  );
};

const DIPTable = ({status, title, types}) => {
  const dips = getDips(status, types);

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
        {dips.map(({dip: num, authors, title}) =>
          <DIPRow
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

DIPTable.propTypes = {
  status: PropTypes.oneOf(Object.values(DIP_STATUS)).isRequired,
  types: PropTypes.arrayOf(PropTypes.oneOf(Object.values(DIP_TYPE))),
};

DIPTable.defaultProps = {
  types: Object.values(DIP_TYPE),
};

export default DIPTable;
