'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket,
  faCog,
  faDownload,
  faBrain,
  faSave,
  faCheckCircle,
  faInfoCircle,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';

export default function GettingStartedPage() {
  const t = useTranslations('documentation');
  const tContent = useTranslations('documentation.sections.gettingStarted.content');
  const params = useParams();
  const locale = params.locale as string;

  const breadcrumbItems = [
    { 
      label: t('breadcrumb.documentation'), 
      href: `/${locale}/documentation` 
    },
    { 
      label: t('breadcrumb.gettingStarted') 
    }
  ];

  const quickStartSteps = [
    {
      number: '01',
      title: 'Admin Panel Setup',
      description: tContent('quickStart.step1'),
      icon: faCog,
      href: `/${locale}/documentation/admin-panel`
    },
    {
      number: '02',
      title: 'Configure Scrapers',
      description: tContent('quickStart.step2'),
      icon: faDownload,
      href: `/${locale}/documentation/scrappers`
    },
    {
      number: '03',
      title: 'Use Cognitahz',
      description: tContent('quickStart.step3'),
      icon: faBrain,
      href: `/${locale}/documentation/cognitahz`
    },
    {
      number: '04',  
      title: 'Setup Backups',
      description: tContent('quickStart.step4'),
      icon: faSave,
      href: `/${locale}/documentation/backups`
    }
  ];

  const systemRequirements = [
    tContent('systemRequirements.requirement1'),
    tContent('systemRequirements.requirement2'),
    tContent('systemRequirements.requirement3')
  ];

  return (
    <div className="documentation-page">
      <div className="documentation-header">
        <Breadcrumb items={breadcrumbItems} />
        <div className="documentation-hero">
          <div className="hero-icon">
            <FontAwesomeIcon icon={faRocket} />
          </div>
          <h1 className="documentation-title">{tContent('overview.title')}</h1>
          <p className="documentation-subtitle">{tContent('overview.description')}</p>
        </div>
      </div>

      <div className="documentation-content-body">
        <div className="content-section">
          <div className="section-header">
            <div className="section-icon">
              <FontAwesomeIcon icon={faLightbulb} />
            </div>
            <h2 className="section-title">{tContent('quickStart.title')}</h2>
          </div>
          
          <div className="quick-start-steps">
            {quickStartSteps.map((step) => (
              <div key={step.number} className="step-card">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <div className="step-header">
                    <FontAwesomeIcon icon={step.icon} className="step-icon" />
                    <h3 className="step-title">{step.title}</h3>
                  </div>
                  <p className="step-description">{step.description}</p>
                  <Link href={step.href} className="step-link">
                    Learn more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <div className="section-icon">
              <FontAwesomeIcon icon={faInfoCircle} />
            </div>
            <h2 className="section-title">{tContent('systemRequirements.title')}</h2>
          </div>

          <div className="requirements-list">
            {systemRequirements.map((requirement, index) => (
              <div key={index} className="requirement-item">
                <FontAwesomeIcon icon={faCheckCircle} className="requirement-icon" />
                <span className="requirement-text">{requirement}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <div className="next-steps-card">
            <h2 className="next-steps-title">Ready to get started?</h2>
            <p className="next-steps-description">
              Begin by setting up your admin panel to configure users and system settings.
            </p>
            <Link href={`/${locale}/documentation/admin-panel`} className="next-steps-button">
              <FontAwesomeIcon icon={faCog} />
              Go to Admin Panel Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}