'use client';

import Header from '@/components/Header';
import AppButton from '@/components/AppButton';
import InfoBox from '@/components/InfoBox';
import { faCog, faDownload, faBrain, faSave } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('buttons');
  
  console.log('Home component rendering...');
  
  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="content-wrapper">
            <div className="button-grid">
                <AppButton icon={faCog} href="/admin">
                  {t('adminPanel')}
                </AppButton>
                <AppButton icon={faDownload} href="/scrappers">
                  {t('scrappers')}
                </AppButton>
                <AppButton icon={faBrain} href="/cognitahz">
                  {t('cognitahz')}
                </AppButton>
                <AppButton icon={faSave} href="/backups">
                  {t('backups')}
                </AppButton>
            </div>
            <InfoBox />
        </div>
      </main>
    </div>
  );
}
