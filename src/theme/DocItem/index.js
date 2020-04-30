import React, {useEffect} from 'react';

import Head from '@docusaurus/Head';
import isInternalUrl from '@docusaurus/isInternalUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocPaginator from '@theme/DocPaginator';
import useTOCHighlight from '@theme/hooks/useTOCHighlight';
import {scrollToTop, toTitleCase} from '../../utils';

import classnames from 'classnames';
import styles from './styles.module.css';

const LINK_CLASS_NAME = 'contents__link';
const ACTIVE_LINK_CLASS_NAME = 'contents__link--active';
const TOP_OFFSET = 100;
const HEADER_ID = 'header';
const METADATA_TABLE_ID = 'metadata-table';

function DocTOC({headings}) {
  return (
    <div className="col col--3">
      <div className={styles.tableOfContents}>
        <Headings headings={headings} />
      </div>
    </div>
  );
}

/* eslint-disable jsx-a11y/control-has-associated-label */
function Headings({headings, isChild}) {
  if (!headings.length) {
    return null;
  }
  return (
    <ul className={isChild ? '' : 'contents contents__left-border'}>
      {headings.map(heading => (
        <li className={styles.tocLink} key={heading.id}>
          <a
            href={`#${heading.id}`}
            className={LINK_CLASS_NAME}
            dangerouslySetInnerHTML={{__html: heading.value}}
          />
          <Headings isChild headings={heading.children} />
        </li>
      ))}
    </ul>
  );
}

const MetadataTable = ({rows}) => (
  <table className={styles.metadataTable}>
    <tbody>
      {rows.map(([key, val, link]) => 
        <React.Fragment key={key}>
          {val !== undefined &&
            <tr>
              <td>{key}</td>
              <td>
                {link ? <a href={link}>{val}</a> : val}
              </td>
            </tr>
          }
        </React.Fragment>
      )}
    </tbody>
  </table>
);

const getHeadings = (initialHeadings, titleLabel, includeMetadataTable) => 
  [
    ...titleLabel ? [{children: [], value: titleLabel, id: HEADER_ID}] : [],
    ...includeMetadataTable ? [{children: [], value: "Meta data", id: METADATA_TABLE_ID}] : [],
    ...initialHeadings,
  ];

/**
 * This is necessary right now because we are transferring
 * all doc files and lips to an artifical folder that does
 * not reflect the actual github location.
 */
const getEditUrl = (originalUrl, isLip) => {
  if (!originalUrl) {
    return undefined;
  }

  const urlArr = originalUrl.split('/');
  const sourceIndex = urlArr.length - 2;
  // replaces the build folder with the original
  urlArr[sourceIndex] = isLip ? 'lips' : 'docs';
  return urlArr.join('/');
}


function DocItem(props) {
  const {siteConfig = {}} = useDocusaurusContext();
  const {url: siteUrl, title: siteTitle} = siteConfig;
  const {content: DocContent} = props;
  const {metadata} = DocContent;
  const {
    description,
    title,
    permalink,
    editUrl,
    lastUpdatedAt,
    lastUpdatedBy,
    version,
  } = metadata;
  const {
    frontMatter: {
      author,
      created,
      'discussions-to': discussionsTo,
      image: metaImage,
      keywords,
      hide_title: hideTitle,
      hide_table_of_contents: hideTableOfContents,
      lip,
      status,
      title_toc_label: titleTOCLabel,
      type,
    },
  } = DocContent;

  const displayLipTable = lip !== undefined;
  const headings = getHeadings(DocContent.rightToc, titleTOCLabel, displayLipTable);

  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  let metaImageUrl = siteUrl + useBaseUrl(metaImage);
  if (!isInternalUrl(metaImage)) {
    metaImageUrl = metaImage;
  }

  const githubEditURL = getEditUrl(editUrl, lip !== undefined);

  useEffect(scrollToTop, []);

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta property="og:title" content={metaTitle} />
        {description && <meta name="description" content={description} />}
        {description && (
          <meta property="og:description" content={description} />
        )}
        {keywords && keywords.length && (
          <meta name="keywords" content={keywords.join(',')} />
        )}
        {metaImage && <meta property="og:image" content={metaImageUrl} />}
        {metaImage && <meta property="twitter:image" content={metaImageUrl} />}
        {metaImage && (
          <meta name="twitter:image:alt" content={`Image for ${title}`} />
        )}
        {permalink && <meta property="og:url" content={siteUrl + permalink} />}
      </Head>
      <div>
        <div className="container">
          <div className="row">
            <div className={classnames('col', styles.docItemCol)}>
              <div className={styles.docItemContainer}>
                <article>
                  {version && (
                    <div>
                      <span className="badge badge--secondary">
                        Version: {version}
                      </span>
                    </div>
                  )}
                  <header className={styles.header} id={HEADER_ID}>
                    {!hideTitle && (
                      <h2 className={styles.docTitle}>{title}</h2>
                    )}
                    {githubEditURL && (
                      <a 
                        className={styles.editButton}
                        href={githubEditURL}
                        target="_blank"
                      >
                        EDIT
                      </a>
                    )}
                  </header>
                  {displayLipTable &&
                    <div id={METADATA_TABLE_ID}>
                      <MetadataTable 
                        rows={[
                          ["LIP", lip],
                          ["Title", title],
                          ["Author", `@${author}`, `https://github.com/${author}`],
                          ["Discussions-to", discussionsTo, discussionsTo],
                          ["Status", toTitleCase(status)],
                          ["Type", toTitleCase(type)],
                          ["Created", created],
                        ]}
                      />
                    </div>
                  }
                  <div className="markdown">
                    <DocContent />
                  </div>
                </article>
                {(githubEditURL || lastUpdatedAt || lastUpdatedBy) && (
                  <div className="margin-vert--xl">
                    <div className={styles.copyright}>
                      Copyright Notice: This documentation is made available 
                      under the Creative Commons Attribution 4.0 International 
                      (CC BY 4.0) license (available at 
                        <a href="https://creativecommons.org/licenses/by/4.0/" target="blank"> https://creativecommons.org/licenses/by/4.0/</a>).
                    </div>
                    <div className="row">
                      {(lastUpdatedAt || lastUpdatedBy) && (
                        <div className="col text--right">
                          <em>
                            <small>
                              Last updated{' '}
                              {lastUpdatedAt && (
                                <>
                                  on{' '}
                                  <time
                                    dateTime={new Date(
                                      lastUpdatedAt * 1000,
                                    ).toISOString()}
                                    className={styles.docLastUpdatedAt}>
                                    {new Date(
                                      lastUpdatedAt * 1000,
                                    ).toLocaleDateString()}
                                  </time>
                                  {lastUpdatedBy && ' '}
                                </>
                              )}
                              {lastUpdatedBy && (
                                <>
                                  by <strong>{lastUpdatedBy}</strong>
                                </>
                              )}
                              {process.env.NODE_ENV === 'development' && (
                                <div>
                                  <small>
                                    {' '}
                                    (Simulated during dev for better perf)
                                  </small>
                                </div>
                              )}
                            </small>
                          </em>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!hideTableOfContents && DocContent.rightToc && (
              <DocTOC headings={headings} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DocItem;
