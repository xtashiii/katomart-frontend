'use client';

import Header from '@/components/Header';
import AppButton from '@/components/AppButton';
import InfoBox from '@/components/InfoBox';
import { faCog, faDownload, faBrain, faSave } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('buttons');
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main
        className="main-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 700,
            gap: '2rem',
          }}
        >
          <div
            className="button-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              width: '100%',
              maxWidth: 400,
            }}
          >
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
  {/* Footer is included in the layout, do not render here */}
    </div>
  );
}
