import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'es', 'pt'];
const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {

  const validLocale = locale && locales.includes(locale) ? locale : defaultLocale;
  
  if (locale !== validLocale) {
    console.warn(`Invalid or missing locale: ${locale}, falling back to: ${validLocale}`);
  }

  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default
  };
});
