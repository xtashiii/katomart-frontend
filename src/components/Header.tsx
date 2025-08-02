'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const t = useTranslations('header');
  
  return (
    <header className="header">
      <div className="header-controls">
        <LanguageSwitcher />
      </div>
      <h1 className="header-title">{t('brand')}</h1>
      <div className="header-controls">
        <a href="/documentation">
          <FontAwesomeIcon icon={faQuestionCircle} />
          {t('help')}
        </a>
      </div>
    </header>
  );
};

export default Header;
