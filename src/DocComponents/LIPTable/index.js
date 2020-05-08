import React from 'react';
import PropTypes from 'prop-types';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import filesByType from '../../../LIPMetadata.json';
import {LIP_TYPE, LIP_STATUS} from '../../enums';
import styles from './styles.module.css';

const getLips = (status, types) =>
  types.reduce((lips, type) => {
    return lips.concat(filesByType[type][status]);
  }, []).sort((a, b) => a.lip < b.lip ? 1 : -1);

const LIPRow = ({ author, num, title }) => {
  const {siteConfig: {themeConfig}} = useDocusaurusContext();

  return (
    <tr>
      <td>
        <a href={useBaseUrl(`/lip-${num}`)}>
          {num}
        </a>
      </td>
      <td>{title}</td>
      <td>
        <a 
          href={`https://github.com/${author}`} 
          target="_blank"
        >
          {author}
        </a>
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
        {lips.map(({lip: num, author, title}) => 
          <LIPRow 
            author={author} 
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
