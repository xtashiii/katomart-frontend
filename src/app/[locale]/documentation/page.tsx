'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRocket,
  faCog,
  faDownload,
  faBrain,
  faSave,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';

export default function DocumentationPage() {
  const t = useTranslations('documentation');
  const tSections = useTranslations('documentation.sections');
  const params = useParams();
  const locale = params.locale as string;

  const sections = [
    {
      href: `/${locale}/documentation/getting-started`,
      title: tSections('gettingStarted.title'),
      description: tSections('gettingStarted.description'),
      icon: faRocket,
      color: 'from-blue-500 to-blue-600',
    },
    {
      href: `/${locale}/documentation/admin-panel`,
      title: tSections('adminPanel.title'),
      description: tSections('adminPanel.description'),
      icon: faCog,
      color: 'from-purple-500 to-purple-600',
    },
    {
      href: `/${locale}/documentation/scrappers`,
      title: tSections('scrappers.title'),
      description: tSections('scrappers.description'),
      icon: faDownload,
      color: 'from-green-500 to-green-600',
    },
    {
      href: `/${locale}/documentation/cognitahz`,
      title: tSections('cognitahz.title'),
      description: tSections('cognitahz.description'),
      icon: faBrain,
      color: 'from-orange-500 to-orange-600',
    },
    {
      href: `/${locale}/documentation/backups`,
      title: tSections('backups.title'),
      description: tSections('backups.description'),
      icon: faSave,
      color: 'from-red-500 to-red-600',
    },
  ];

  const breadcrumbItems = [{ label: t('breadcrumb.documentation') }];

  return (
    <div className="documentation-page">
      <div className="documentation-header">
        <Breadcrumb items={breadcrumbItems} />
        <div className="documentation-hero">
          <h1 className="documentation-title">{t('title')}</h1>
          <p className="documentation-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div className="documentation-sections">
        <div className="sections-grid">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="section-card"
            >
              <div
                className={`section-icon bg-gradient-to-br ${section.color}`}
              >
                <FontAwesomeIcon icon={section.icon} />
              </div>
              <div className="section-content">
                <h3 className="section-title">{section.title}</h3>
                <p className="section-description">{section.description}</p>
                <div className="section-arrow">
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="documentation-quick-links">
        <div className="quick-links-container">
          <h2 className="quick-links-title">Quick Access</h2>
          <div className="quick-links-grid">
            <Link
              href={`/${locale}/documentation/getting-started`}
              className="quick-link"
            >
              <FontAwesomeIcon icon={faRocket} />
              <span>Get Started</span>
            </Link>
            <Link href={`/${locale}/admin`} className="quick-link">
              <FontAwesomeIcon icon={faCog} />
              <span>Admin Panel</span>
            </Link>
            <Link href={`/${locale}/scrappers`} className="quick-link">
              <FontAwesomeIcon icon={faDownload} />
              <span>Scrappers</span>
            </Link>
            <Link href={`/${locale}/cognitahz`} className="quick-link">
              <FontAwesomeIcon icon={faBrain} />
              <span>Cognitahz</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
