'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' }
];

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const localeFromHook = useLocale();
  const params = useParams();

  const pathSegments = pathname.split('/').filter(Boolean);
  const localeFromPath = pathSegments.find(segment => 
    ['en', 'es', 'pt'].includes(segment)
  ) || 'en';

  const currentLocale = localeFromPath || localeFromHook;

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) {
      return;
    }

    const segments = pathname.split('/').filter(Boolean);
    
    const localeIndex = segments.findIndex(segment => 
      ['en', 'es', 'pt'].includes(segment)
    );
    
    if (localeIndex !== -1) {
      segments.splice(localeIndex, 1);
    }
    
    const pathWithoutLocale = segments.length > 0 ? `/${segments.join('/')}` : '';
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    console.log(`Language switch: "${currentLocale}" -> "${newLocale}"`);
    console.log(`Current path: ${pathname}`);
    console.log(`Path segments after locale removal:`, segments);
    console.log(`New path: ${newPath}`);
    
    window.location.href = newPath;
  };

  return (
    <div className="header-lang-select">
      <select 
        value={currentLocale} 
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
