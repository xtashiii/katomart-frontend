'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPlay, faStop, faCog } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';

export default function ScrappersPage() {
  const t = useTranslations('documentation');
  const tSections = useTranslations('documentation.sections');
  const params = useParams();
  const locale = params.locale as string;

  const breadcrumbItems = [
    { 
      label: t('breadcrumb.documentation'), 
      href: `/${locale}/documentation` 
    },
    { 
      label: tSections('scrappers.title')
    }
  ];

  return (
    <div className="documentation-page">
      <div className="documentation-header">
        <Breadcrumb items={breadcrumbItems} />
        <div className="documentation-hero">
          <div className="hero-icon">
            <FontAwesomeIcon icon={faDownload} />
          </div>
          <h1 className="documentation-title">{tSections('scrappers.title')}</h1>
          <p className="documentation-subtitle">{tSections('scrappers.description')}</p>
        </div>
      </div>

      <div className="documentation-content-body">
        <div className="content-section">
          <div className="section-header">
            <div className="section-icon">
              <FontAwesomeIcon icon={faCog} />
            </div>
            <h2 className="section-title">{tSections('scrappers.setup')}</h2>
          </div>
          <div className="requirements-list">
            <div className="requirement-item">
              <FontAwesomeIcon icon={faPlay} className="requirement-icon" />
              <span className="requirement-text">Configure your target sources and data extraction rules</span>
            </div>
            <div className="requirement-item">
              <FontAwesomeIcon icon={faCog} className="requirement-icon" />
              <span className="requirement-text">Set up scheduling and automation preferences</span>
            </div>
            <div className="requirement-item">
              <FontAwesomeIcon icon={faStop} className="requirement-icon" />
              <span className="requirement-text">Monitor and manage active scraping tasks</span>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="next-steps-card">
            <h2 className="next-steps-title">Ready to configure scrappers?</h2>
            <p className="next-steps-description">
              Access the scrappers panel to set up your content extraction workflows.
            </p>
            <Link href={`/${locale}/scrappers`} className="next-steps-button">
              <FontAwesomeIcon icon={faDownload} />
              Open Scrappers Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
