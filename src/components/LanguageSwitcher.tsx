'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' }
];

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const localeFromHook = useLocale();

  const pathSegments = pathname.split('/').filter((segment: string) => Boolean(segment));
  const localeFromPath = pathSegments.find((segment: string) => 
    ['en', 'es', 'pt'].includes(segment)
  ) || 'en';

  const currentLocale = localeFromPath || localeFromHook;

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) {
      return;
    }
    const segments = pathname.split('/').filter((segment: string) => Boolean(segment));
    if (['en', 'es', 'pt'].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPath = '/' + segments.join('/');
    router.replace(newPath);
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
