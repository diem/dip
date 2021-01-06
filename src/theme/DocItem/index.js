import React from 'react';
import {RightSidebar} from 'libra-docusaurus-components';

import Head from '@docusaurus/Head';
import Heading from '@theme/Heading';
import isInternalUrl from '@docusaurus/isInternalUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocPaginator from '@theme/DocPaginator';
import useTOCHighlight from '@theme/hooks/useTOCHighlight';

import Author from 'src/DocComponents/Author';
import {parseAuthors, toTitleCase} from '../../utils';

import classnames from 'classnames';
import styles from './styles.module.css';

const HEADER_ID = 'header';
const METADATA_TABLE_ID = 'metadata-table';

const MetadataTable = ({rows}) => (
  <table className={styles.metadataTable}>
    <tbody>
      {rows.map(([key, val, link]) =>
        <React.Fragment key={key}>
          {val !== undefined &&
            <tr>
              <td>{key}</td>
              <td>
                {link
                  ? <a href={link} target="_blank">{val}</a>
                  : val
                }
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
 * all doc files and dips to an artifical folder that does
 * not reflect the actual github location.
 */
const getEditUrl = (originalUrl, isDip) => {
  if (!originalUrl) {
    return undefined;
  }

  const urlArr = originalUrl.split('/');
  const sourceIndex = urlArr.length - 2;
  // replaces the build folder with the original
  urlArr[sourceIndex] = isDip ? 'dips' : 'docs';
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
      authors,
      created,
      'discussions-to': discussionsTo,
      image: metaImage,
      keywords,
      hide_title: hideTitle,
      hide_table_of_contents: hideTableOfContents,
      dip,
      status,
      title_toc_label: titleTOCLabel,
      title: frontMatterTitle,
      type,
    },
  } = DocContent;

  const displayDipTable = dip !== undefined;
  const headings = getHeadings(
    DocContent.rightToc,
    titleTOCLabel || title,
    displayDipTable,
  );

  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  let metaImageUrl = siteUrl + useBaseUrl(metaImage);
  if (!isInternalUrl(metaImage)) {
    metaImageUrl = metaImage;
  }

  const githubEditURL = getEditUrl(editUrl, dip !== undefined);

  const Title = Heading('h2');

  const Authors = displayDipTable
    ? parseAuthors(authors).map(({title, username}, i) =>
        <Author title={title} username={username} index={i} />
      )
    : [];

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
      <div
        className={classnames(
          'container',
          styles.docItemWrapper,
        )}
      >
        <div className={classnames(styles.docItemCol)}>
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
                    <Title className={styles.docTitle} id={title}>{title}</Title>
                  )}
                </header>
                {displayDipTable &&
                  <div id={METADATA_TABLE_ID}>
                    <MetadataTable
                      rows={[
                        ["DIP", dip],
                        ["Title", title],
                        ["Author", Authors],
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
                <div className="margin-bottom--lg margin-top--xl">
                  <div className={styles.copyright}>
                    Copyright Notice: This documentation is made available
                    under the Creative Commons Attribution 4.0 International
                    (CC BY 4.0) license (available at
                      <a href="https://creativecommons.org/licenses/by/4.0/" target="blank"> https://creativecommons.org/licenses/by/4.0/</a>).
                  </div>
                </div>
            </article>
          </div>
        </div>
        <RightSidebar
          editUrl={githubEditURL}
          headings={headings}
        />
      </div>
    </>
  );
}

export default DocItem;
