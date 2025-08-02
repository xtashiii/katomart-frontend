'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const t = useTranslations('header');
  const params = useParams();
  const locale = params.locale as string;
  
  return (
    <header className="header">
      <div className="header-controls">
        <LanguageSwitcher />
      </div>
      <h1 className="header-title">{t('brand')}</h1>
      <div className="header-controls">
        <Link href={`/${locale}/documentation`} target="_blank">
          <FontAwesomeIcon icon={faQuestionCircle} />
          {t('help')}
        </Link>
      </div>
    </header>
  );
};

export default Header;
