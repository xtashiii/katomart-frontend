'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import AppButton from './AppButton';

interface Platform {
  id: string;
  name: string;
  needsLoginUrl?: boolean;
  needsBaseUrl?: boolean;
  loginUrlLabel?: string;
  baseUrlLabel?: string;
}

interface PlatformSettingsProps {
  onLoginSuccess: () => void;
}

export default function PlatformSettings({ onLoginSuccess }: PlatformSettingsProps) {
  const t = useTranslations('platform');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'cookies'>('credentials');
  const [cookiesFile, setCookiesFile] = useState<File | null>(null);
  const [useSelenium, setUseSelenium] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/scrappers/platforms');
        if (!response.ok) {
          throw new Error('Failed to fetch platforms');
        }
        const data = await response.json();
        setPlatforms(data.platforms);
        if (data.platforms.length > 0) {
          setSelectedPlatform(data.platforms[0].id);
        }
      } catch (error) {
        console.error(error);
        setError('Could not load platforms.');
      }
    };
    fetchPlatforms();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    // Always succeed for mock/demo
    setTimeout(() => {
      onLoginSuccess();
      setIsLoading(false);
    }, 800);
  };
  
  const platform = platforms.find(p => p.id === selectedPlatform);

  const handle2FALogin = () => {
    alert('Use Cookies file instead');
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
          Platform
        </label>
        <select
          id="platform"
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-lg shadow-sm transition"
        >
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {platform?.needsLoginUrl && (
        <div>
          <label htmlFor="loginUrl" className="block text-sm font-medium text-gray-700">
            {platform.loginUrlLabel || 'Login URL'}
          </label>
          <input
            type="text"
            id="loginUrl"
            value={loginUrl}
            onChange={(e) => setLoginUrl(e.target.value)}
            className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition"
          />
        </div>
      )}

      {platform?.needsBaseUrl && (
        <div>
          <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700">
            {platform.baseUrlLabel || 'Base URL (optional)'}
          </label>
          <input
            type="text"
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('loginMethod')}
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="loginMethod"
              value="credentials"
              checked={loginMethod === 'credentials'}
              onChange={(e) => setLoginMethod(e.target.value as 'credentials' | 'cookies')}
              className="mr-2"
            />
            <span className="text-sm">{t('usernamePassword')}</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="loginMethod"
              value="cookies"
              checked={loginMethod === 'cookies'}
              onChange={(e) => setLoginMethod(e.target.value as 'credentials' | 'cookies')}
              className="mr-2"
            />
            <span className="text-sm">{t('cookiesFile')}</span>
          </label>
        </div>
        {loginMethod === 'cookies' && (
          <p className="text-xs text-blue-600 mt-1">{t('cookiesFileDescription')}</p>
        )}
      </div>

      {loginMethod === 'credentials' ? (
        <>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition"
            />
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="cookiesFile" className="block text-sm font-medium text-gray-700">
            {t('cookiesFileLabel')}
          </label>
          <input
            type="file"
            id="cookiesFile"
            accept=".txt,.cookies"
            onChange={(e) => setCookiesFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
          />
          {cookiesFile && (
            <p className="text-xs text-gray-500 mt-1">Selected: {cookiesFile.name}</p>
          )}
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="useSelenium"
          checked={useSelenium}
          onChange={(e) => setUseSelenium(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="useSelenium" className="text-sm">
          {t('seleniumAuth')}
        </label>
      </div>
      <p className="text-xs text-gray-500">{t('seleniumAuthDescription')}</p>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex space-x-3">
        <AppButton 
          onClick={handleLogin} 
          disabled={
            isLoading ||
            !selectedPlatform ||
            (platform?.needsLoginUrl ? !loginUrl : false) ||
            (platform?.needsBaseUrl ? !baseUrl : false) ||
            (loginMethod === 'credentials' ? (!username || !password) : !cookiesFile)
          }
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </AppButton>
        
        <AppButton 
          onClick={handle2FALogin}
          disabled={false}
        >
          {t('2faSupported')}
        </AppButton>
      </div>
    </div>
  );
}
