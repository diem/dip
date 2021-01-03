import React from 'react';
import {MDXProvider} from '@mdx-js/react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import renderRoutes from '@docusaurus/renderRoutes';
import Layout from '@theme/Layout';
import DocSidebar from '@theme/DocSidebar';
import ThemeComponents from '@theme/MDXComponents';
import NotFound from '@theme/NotFound';
import {matchPath} from '@docusaurus/router';

import DocComponents from '../../DocComponents';

import styles from './styles.module.css';

const MDXComponents = Object.assign(ThemeComponents, DocComponents);

function DocPage(props) {
  const {route: baseRoute, versionMetadata, location} = props;
  // case-sensitive route such as it is defined in the sidebar
  const currentRoute =
    baseRoute.routes.find(route => {
      return matchPath(location.pathname, route);
    }) || {};
  const {permalinkToSidebar, docsSidebars, version} = versionMetadata;
  const sidebarName = permalinkToSidebar[currentRoute.path] || 'main';
  const sidebar = docsSidebars[sidebarName];
  const {
    siteConfig: {themeConfig = {}} = {},
    isClient,
  } = useDocusaurusContext();
  const {sidebarCollapsible = true} = themeConfig;

  if (Object.keys(currentRoute).length === 0) {
    return <NotFound {...props} />;
  }

  return (
    <Layout version={version} key={isClient}>
      <div className={styles.docPage}>
        {sidebar && (
          <div className={styles.docSidebarContainer}>
            <DocSidebar
              docsSidebars={docsSidebars}
              path={currentRoute.path}
              sidebar={sidebar}
              sidebarCollapsible={sidebarCollapsible}
            />
          </div>
        )}
        <main className={styles.docMainContainer}>
          <MDXProvider components={MDXComponents}>
            {renderRoutes(baseRoute.routes)}
          </MDXProvider>
        </main>
      </div>
    </Layout>
  );
}

export default DocPage;
