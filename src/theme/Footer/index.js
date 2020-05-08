import React from 'react';
import classnames from 'classnames';

import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import GitHubButton from 'react-github-btn';
import {TwitterFollowButton} from 'react-twitter-embed';

function FooterLink({to, href, label, ...props}) {
  const toUrl = useBaseUrl(to);
  return (
    <Link
      className="footer__link-item"
      {...(href
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
            href,
          }
        : {
            to: toUrl,
          })}
      {...props}>
      {label}
    </Link>
  );
}

const FooterLogo = ({url, alt}) => (
  <img 
    alt={alt} 
    className={classnames("footer__logo", styles.logo)} 
    src={url} 
  />
);

const LinkSectionContainer = ({children, title}) => (
  <div className={classnames("col footer__col", styles.linkSection)}>
    <h4 className={classnames("footer__title", styles.title)}>{title}</h4>
    <ul className="footer__items">
      {children}
    </ul>
  </div>
);

const LinkSection = ({items, title}) => (
  <LinkSectionContainer title={title}>
    {items.map((item, key) =>
      item.html ? (
        <li
          key={key}
          className="footer__item"
          dangerouslySetInnerHTML={{
            __html: item.html,
          }}
        />
      ) : (
        <li key={item.href || item.to} className="footer__item">
          <FooterLink {...item} />
        </li>
      ),
    )}
  </LinkSectionContainer>
);

function Footer() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  const {themeConfig = {}, projectName} = siteConfig;
  const {footer} = themeConfig;

  const {copyright, links = [], logo = {}, social = {}} = footer || {};
  const {twitterHandle, githubRepo} = social;
  const logoUrl = useBaseUrl(logo.src);

  if (!footer) {
    return null;
  }

  const linkSections = [];
  for (let i = 0; i < links.length; i+=2) {
    linkSections.push(
      <div key={i} className={styles.linkColumn}>
        <LinkSection items={links[i].items} title={links[i].title} />
        {links[i+1] &&
          <LinkSection items={links[i+1].items} title={links[i+1].title} />
        }
      </div>
    );
  }

  return (
    <footer
      className={classnames('footer', {
        'footer--dark': footer.style === 'dark',
      })}>
      <div className="container">
        {links && links.length > 0 && (
          <div className="row footer__links">
            {logo.href ? (
              <a
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLogoLink}>
                <FooterLogo alt={logo.alt} url={logoUrl} />
              </a>
            ) : (
              <FooterLogo alt={logo.alt} url={logoUrl} />
            )}
            {linkSections}
            <div className={styles.linkColumn}>
              <LinkSectionContainer title="Social">
                  {twitterHandle &&
                    <li className={styles.socialLink}>
                      <GitHubButton 
                        aria-label={`Star ${projectName} on GitHub`}
                        className={styles.github}
                        data-show-count="true" 
                        href={githubRepo}>
                        {projectName}
                      </GitHubButton>
                    </li>
                  }
                  {githubRepo &&
                    <li className={styles.socialLink}>
                      <TwitterFollowButton
                        className={styles.twitter}
                        options={{
                          showCount: false
                        }}
                        screenName={twitterHandle}
                      />
                    </li>
                  }
              </LinkSectionContainer>
            </div>
          </div>
        )}
        {(logo || copyright) && (
          <div className={classnames("text--center", styles.copyright)}>
            <div
              dangerouslySetInnerHTML={{
                __html: copyright,
              }}
            />
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;
