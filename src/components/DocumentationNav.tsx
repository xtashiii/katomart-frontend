'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCog,
  faDownload,
  faBrain,
  faSave,
  faRocket,
  faUsers,
  faWrench,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: IconDefinition;
  children?: NavItem[];
}

const DocumentationNav: React.FC = () => {
  const t = useTranslations('documentation.sections');
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;

  const navItems: NavItem[] = [
    {
      href: `/${locale}/documentation/getting-started`,
      label: t('gettingStarted.title'),
      icon: faRocket,
    },
    {
      href: `/${locale}/documentation/admin-panel`,
      label: t('adminPanel.title'),
      icon: faCog,
      children: [
        {
          href: `/${locale}/documentation/admin-panel/user-management`,
          label: t('adminPanel.userManagement'),
          icon: faUsers,
        },
        {
          href: `/${locale}/documentation/admin-panel/system-settings`,
          label: t('adminPanel.systemSettings'),
          icon: faWrench,
        },
        {
          href: `/${locale}/documentation/admin-panel/monitoring`,
          label: t('adminPanel.monitoring'),
          icon: faChartLine,
        },
      ],
    },
    {
      href: `/${locale}/documentation/scrappers`,
      label: t('scrappers.title'),
      icon: faDownload,
    },
    {
      href: `/${locale}/documentation/cognitahz`,
      label: t('cognitahz.title'),
      icon: faBrain,
    },
    {
      href: `/${locale}/documentation/backups`,
      label: t('backups.title'),
      icon: faSave,
    },
  ];

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  const isParentActive = (item: NavItem) => {
    if (isActiveLink(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isActiveLink(child.href));
    }
    return false;
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isActive = isActiveLink(item.href);
    const isParent = isParentActive(item);

    return (
      <li key={item.href} className={`nav-item nav-item-level-${level}`}>
        <Link
          href={item.href}
          className={`nav-link ${isActive ? 'nav-link-active' : ''} ${isParent ? 'nav-link-parent-active' : ''}`}
        >
          <FontAwesomeIcon icon={item.icon} className="nav-icon" />
          <span className="nav-label">{item.label}</span>
        </Link>
        {item.children && isParent && (
          <ul className="nav-submenu">
            {item.children.map((child) => renderNavItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className="documentation-nav" aria-label="Documentation navigation">
      <ul className="nav-list">
        {navItems.map((item) => renderNavItem(item))}
      </ul>
    </nav>
  );
};

export default DocumentationNav;
