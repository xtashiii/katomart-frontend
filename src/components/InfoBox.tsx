'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const InfoBox = () => {
  const t = useTranslations('info');
  
  return (
    <div className="info-box">
        <ul>
            <li>{t.rich('adminPanel', { b: (chunks) => <b>{chunks}</b> })}</li>
            <li>{t.rich('downloads', { b: (chunks) => <b>{chunks}</b> })}</li>
            <li>{t.rich('cognitahz', { b: (chunks) => <b>{chunks}</b> })}</li>
            <li>{t.rich('backups', { b: (chunks) => <b>{chunks}</b> })}</li>
        </ul>
    </div>
  );
};

export default InfoBox;
