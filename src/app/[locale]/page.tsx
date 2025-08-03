'use client';

import Header from '@/components/Header';
import AppButton from '@/components/AppButton';
import InfoBox from '@/components/InfoBox';
import { faCog, faDownload, faBrain, faSave } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('buttons');
  
  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="content-wrapper">
            <div className="button-grid">
                <AppButton icon={faCog} href="/admin" requiresAuth={true}>
                  {t('adminPanel')}
                </AppButton>
                <AppButton icon={faDownload} href="/scrappers" requiresAuth={true}>
                  {t('scrappers')}
                </AppButton>
                <AppButton icon={faBrain} href="/cognitahz" requiresAuth={true}>
                  {t('cognitahz')}
                </AppButton>
                <AppButton icon={faSave} href="/backups" requiresAuth={true}>
                  {t('backups')}
                </AppButton>
            </div>
            <InfoBox />
        </div>
      </main>
    </div>
  );
}
