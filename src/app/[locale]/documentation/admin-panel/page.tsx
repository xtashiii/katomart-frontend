'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faUsers,
  faWrench,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';

export default function AdminPanelPage() {
  const t = useTranslations('documentation');
  const tSections = useTranslations('documentation.sections');
  const params = useParams();
  const locale = params.locale as string;

  const breadcrumbItems = [
    {
      label: t('breadcrumb.documentation'),
      href: `/${locale}/documentation`,
    },
    {
      label: tSections('adminPanel.title'),
    },
  ];

  const adminSections = [
    {
      href: `/${locale}/documentation/admin-panel/user-management`,
      title: tSections('adminPanel.userManagement'),
      description: 'Manage user accounts, permissions, and access controls',
      icon: faUsers,
      color: 'from-blue-500 to-blue-600',
    },
    {
      href: `/${locale}/documentation/admin-panel/system-settings`,
      title: tSections('adminPanel.systemSettings'),
      description: 'Configure system-wide settings and preferences',
      icon: faWrench,
      color: 'from-green-500 to-green-600',
    },
    {
      href: `/${locale}/documentation/admin-panel/monitoring`,
      title: tSections('adminPanel.monitoring'),
      description: 'Monitor system performance and health metrics',
      icon: faChartLine,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="documentation-page">
      <div className="documentation-header">
        <Breadcrumb items={breadcrumbItems} />
        <div className="documentation-hero">
          <div className="hero-icon">
            <FontAwesomeIcon icon={faCog} />
          </div>
          <h1 className="documentation-title">
            {tSections('adminPanel.title')}
          </h1>
          <p className="documentation-subtitle">
            {tSections('adminPanel.description')}
          </p>
        </div>
      </div>

      <div className="documentation-content-body">
        <div className="content-section">
          <div className="sections-grid">
            {adminSections.map((section) => (
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
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="content-section">
          <div className="next-steps-card">
            <h2 className="next-steps-title">
              Need to access the Admin Panel?
            </h2>
            <p className="next-steps-description">
              Access the live admin panel to manage your Katomart system.
            </p>
            <Link href={`/${locale}/admin`} className="next-steps-button">
              <FontAwesomeIcon icon={faCog} />
              Open Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
