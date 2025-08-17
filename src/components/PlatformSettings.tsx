'use client';

import { useState, useEffect } from 'react';
import AppButton from './AppButton';

interface Platform {
  id: string;
  name: string;
  needsAuthUrl: boolean;
}

interface PlatformSettingsProps {
  onLoginSuccess: () => void;
}

export default function PlatformSettings({ onLoginSuccess }: PlatformSettingsProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch platforms from the server
    const fetchPlatforms = async () => {
      // Mocking platform data for now
      const mockPlatforms: Platform[] = [
        { id: 'platform1', name: 'Platform A', needsAuthUrl: true },
        { id: 'platform2', name: 'Platform B', needsAuthUrl: false },
      ];
      setPlatforms(mockPlatforms);
      setSelectedPlatform(mockPlatforms[0]?.id || '');
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

      {platform?.needsAuthUrl && (
        <div>
          <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700">
            Base URL
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

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <AppButton 
        onClick={handleLogin} 
        disabled={
          isLoading ||
          !selectedPlatform ||
          (platform?.needsAuthUrl ? !baseUrl : false) ||
          !username ||
          !password
        }
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </AppButton>
    </div>
  );
}
