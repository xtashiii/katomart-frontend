'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const t = useTranslations('header');
  const params = useParams();
  const locale = params.locale as string;
  const { user, logout, isLoggedIn } = useAuth();
  
  return (
    <header className="header">
      <div className="header-controls">
        <LanguageSwitcher />
      </div>
      <h1 className="header-title">{t('brand')}</h1>
      <div className="header-controls">
        {isLoggedIn && user && (
          <div className="user-info">
            <FontAwesomeIcon icon={faUser} />
            <span>{user.username}</span>
            <button 
              onClick={logout}
              className="logout-button"
              title="Logout"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        )}
        <Link href={`/${locale}/documentation`} target="_blank">
          <FontAwesomeIcon icon={faQuestionCircle} />
          {t('help')}
        </Link>
      </div>
    </header>
  );
};

export default Header;
