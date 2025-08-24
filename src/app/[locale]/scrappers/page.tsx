'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/auth';
import Header from '@/components/Header';
import Tabs from '@/components/Tabs';
import PlatformSettings from '@/components/PlatformSettings';
import CourseList from '@/components/CourseList';
import DownloadSettings from '@/components/DownloadSettings';
import DownloadProgress from '@/components/DownloadProgress';
import BookCard from '@/components/BookCard';
import AppButton from '@/components/AppButton';

// Types for course/module/lesson
interface Lesson {
  id: string;
  name: string;
}
interface Module {
  id: string;
  name: string;
  lessons: Lesson[];
}
interface Course {
  id: string;
  name: string;
  modules: Module[];
}

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover?: string;
  genre?: string;
  publishedYear?: number;
}

interface LibraryPlatform {
  id: string;
  name: string;
  needsLoginUrl?: boolean;
  needsBaseUrl?: boolean;
  loginUrlLabel?: string;
  baseUrlLabel?: string;
}

export default function ScrappersPage() {
  // Additional simple per-download settings
  const [cookieFile, setCookieFile] = useState<File | null>(null);
  const [ffmpegArgs, setFfmpegArgs] = useState('');
  // Additional simple per-download settings
  const [filePattern, setFilePattern] = useState('');
  const [maxConcurrent, setMaxConcurrent] = useState(1);
  const [allowedTypes, setAllowedTypes] = useState('');
  const t = useTranslations('scrappers');
  const tCommon = useTranslations('buttons');
  const tPlatform = useTranslations('platform');
  const tDownload = useTranslations('download');
  const tProgress = useTranslations('progress');
  const tGeneral = useTranslations('general');
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [mainTab, setMainTab] = useState('courses');
  const [platformTab, setPlatformTab] = useState('settings');
  const [isPlatformLoggedIn, setIsPlatformLoggedIn] = useState(false);
  const [libraryTab, setLibraryTab] = useState('login');
  const [isLibraryLoggedIn, setIsLibraryLoggedIn] = useState(false);
  const [loggedInLibraryPlatform, setLoggedInLibraryPlatform] =
    useState<string>('');
  const [downloadingBooks, setDownloadingBooks] = useState<Set<string>>(
    new Set()
  );
  const [downloadNotifications, setDownloadNotifications] = useState<
    Array<{ id: string; message: string; type: 'success' | 'info' }>
  >([]);

  // Persisted state for all tabs
  const [courses, setCourses] = useState<Course[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [libraryPlatforms, setLibraryPlatforms] = useState<LibraryPlatform[]>(
    []
  );
  const [selectedLibraryPlatform, setSelectedLibraryPlatform] =
    useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  ); // selection state
  const [downloadConfig, setDownloadConfig] = useState<{
    downloadPath: string;
    createSubfolders: boolean;
  }>({ downloadPath: '', createSubfolders: true });
  const [downloadState, setDownloadState] = useState<{
    running: boolean;
    paused: boolean;
    progress: Record<string, number>;
    finished: boolean;
  }>({
    running: false,
    paused: false,
    progress: {}, // { [lessonId]: percent }
    finished: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn) {
        router.push('/');
        return;
      }

      const isValid = await verifyAuth();
      if (!isValid) {
        logout();
        router.push('/');
        return;
      }

      setIsLoading(false);
    };

    checkAuth().catch(console.error);
  }, [isLoggedIn, logout, router]);

  // Fetch default configuration values
  useEffect(() => {
    const fetchDefaultConfig = async () => {
      try {
        const response = await fetch('/api/scrappers/download/settings');
        if (response.ok) {
          const data = await response.json();
          setFilePattern(data.filePattern || '%(title)s.%(ext)s');
          setMaxConcurrent(data.maxConcurrent || 3);
          setAllowedTypes(data.allowedTypes || 'mp4, mp3, pdf');
          setFfmpegArgs(data.ffmpegArgs || '');
        }
      } catch (error) {
        console.error('Failed to fetch default config:', error);
        // Fallback values
        setFilePattern('%(title)s.%(ext)s');
        setMaxConcurrent(3);
        setAllowedTypes('mp4, mp3, pdf');
      }
    };

    fetchDefaultConfig();
  }, []);

  // Fetch library platforms
  useEffect(() => {
    const fetchLibraryPlatforms = async () => {
      try {
        const response = await fetch('/api/books/platforms');
        if (response.ok) {
          const data = await response.json();
          setLibraryPlatforms(data.platforms || []);
          if (data.platforms && data.platforms.length > 0) {
            setSelectedLibraryPlatform(data.platforms[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch library platforms:', error);
        // Use existing library platforms from mock API - no fallback needed
      }
    };

    fetchLibraryPlatforms();
  }, []);

  // Fetch books for libraries tab
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const platformParam = loggedInLibraryPlatform
          ? `&platform=${encodeURIComponent(loggedInLibraryPlatform)}`
          : '';
        const response = await fetch(
          `/api/books?search=${encodeURIComponent(bookSearchQuery)}${platformParam}`
        );
        if (response.ok) {
          const data = await response.json();
          setBooks(data.books || []);
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
      }
    };

    fetchBooks();
  }, [bookSearchQuery, loggedInLibraryPlatform]);

  useEffect(() => {
    if (isPlatformLoggedIn) {
      const fetchCourses = async () => {
        try {
          const response = await fetch('/api/scrappers/courses');
          if (!response.ok) {
            console.error('Failed to fetch courses');
            return;
          }
          const data = await response.json();
          setCourses(data.courses);
        } catch (error) {
          console.error(error);
        }
      };
      const fetchDownloadSettings = async () => {
        try {
          const response = await fetch('/api/scrappers/download/settings');
          if (!response.ok) {
            console.error('Failed to fetch download settings');
            return;
          }
          const data = await response.json();
          setDownloadConfig({
            downloadPath: data.downloadPath || '',
            createSubfolders: data.createSubfolders || true,
          });
        } catch (error) {
          console.error(error);
        }
      };
      fetchCourses().catch(console.error);
      fetchDownloadSettings().catch(console.error);
    }
  }, [isPlatformLoggedIn]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (downloadState.running) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('/api/scrappers/download/status');
          if (!response.ok) {
            console.error('Failed to fetch download status');
            return;
          }
          const data = await response.json();
          setDownloadState(data);
          if (!data.running) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error(error);
          setDownloadState((ds) => ({ ...ds, running: false }));
        }
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [downloadState.running]);

  const handleLoginSuccess = () => {
    setIsPlatformLoggedIn(true);
    setPlatformTab('courses');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/scrappers/platforms', { method: 'POST' });
    } catch (error) {
      console.error('Failed to logout from platform', error);
    }
    setIsPlatformLoggedIn(false);
    setPlatformTab('settings');
    setCourses([]);
    setSelectedItems({});
    setDownloadConfig({ downloadPath: '', createSubfolders: true });
    setDownloadState({
      running: false,
      paused: false,
      progress: {},
      finished: false,
    });
  };

  // Download workflow
  const handleStartDownload = async (config: {
    downloadPath: string;
    createSubfolders: boolean;
  }) => {
    setDownloadConfig(config);
    try {
      const response = await fetch('/api/scrappers/download/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedItems,
          courses,
          downloadConfig: config,
          filePattern,
          maxConcurrent,
          allowedTypes,
          ffmpegArgs,
          cookieFile: cookieFile?.name || null, // Only send filename for now
        }),
      });
      if (!response.ok) {
        console.error('Failed to start download');
        return;
      }
      setDownloadState((ds) => ({
        ...ds,
        running: true,
        finished: false,
        paused: false,
        progress: {},
      }));
      setPlatformTab('progress');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePause = async () => {
    try {
      const response = await fetch('/api/scrappers/download/status', {
        method: 'PUT',
      });
      if (!response.ok) {
        console.error('Failed to toggle pause state');
        return;
      }
      const data = await response.json();
      setDownloadState(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStop = async () => {
    try {
      await fetch('/api/scrappers/download/status', {
        method: 'DELETE',
      });
      setDownloadState({
        running: false,
        paused: false,
        progress: {},
        finished: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleReauth = () => setPlatformTab('settings');

  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-lg flex flex-col items-center">
            <div className="animate-pulse text-lg text-gray-500">
              {tGeneral('loading')}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const platformTabs = [
    {
      id: 'settings',
      label: tPlatform('settings'),
      content: <PlatformSettings onLoginSuccess={handleLoginSuccess} />,
      disabled: isPlatformLoggedIn || downloadState.running,
    },
    {
      id: 'courses',
      label: t('coursesTab'),
      content: (
        <CourseList
          isLoggedIn={isPlatformLoggedIn}
          courses={courses}
          setCourses={setCourses}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          onLogout={handleLogout}
        />
      ),
      disabled: !isPlatformLoggedIn || downloadState.running,
    },
    {
      id: 'download-settings',
      label: tDownload('settings'),
      content: (
        <div className="space-y-6">
          {/* Basic Download Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {tDownload('basicSettings')}
            </h3>
            <DownloadSettings
              onStart={handleStartDownload}
              config={downloadConfig}
              setConfig={setDownloadConfig}
              disabled={downloadState.running}
            />
          </div>

          {/* File Management Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('fileManagement')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fileNamingPattern')}
                </label>
                <input
                  type="text"
                  value={filePattern}
                  onChange={(e) => setFilePattern(e.target.value)}
                  className="block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition px-3 py-2"
                  placeholder="%(title)s.%(ext)s"
                  disabled={downloadState.running}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('filePatternHelp')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('allowedFileTypes')}
                </label>
                <input
                  type="text"
                  value={allowedTypes}
                  onChange={(e) => setAllowedTypes(e.target.value)}
                  className="block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition px-3 py-2"
                  placeholder="mp4, mp3, pdf"
                  disabled={downloadState.running}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('allowedTypesHelp')}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('performanceSettings')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('maxConcurrentDownloads')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxConcurrent}
                  onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                  className="block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition px-3 py-2"
                  disabled={downloadState.running}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('concurrentHelp')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ffmpegArgs')}
                </label>
                <input
                  type="text"
                  value={ffmpegArgs}
                  onChange={(e) => setFfmpegArgs(e.target.value)}
                  className="block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition px-3 py-2"
                  placeholder="e.g. -vf scale=1280:720 -b:v 1M -preset fast"
                  disabled={downloadState.running}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('ffmpegArgsHelp')}
                </p>
              </div>
            </div>
          </div>

          {/* Authentication Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('authSettings')}
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cookieFile')}
              </label>
              <input
                type="file"
                accept=".txt,.cookies"
                onChange={(e) => setCookieFile(e.target.files?.[0] || null)}
                className="block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                disabled={downloadState.running}
              />
              {cookieFile && (
                <div className="text-xs text-gray-500 mt-1">
                  {t('selected')} {cookieFile.name}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {t('cookieFileHelp')}
              </p>
            </div>
          </div>
        </div>
      ),
      disabled: !isPlatformLoggedIn || downloadState.running,
    },
    {
      id: 'progress',
      label: tProgress('progress'),
      content: (
        <DownloadProgress
          courses={courses}
          selectedItems={selectedItems}
          progress={downloadState.progress}
          running={downloadState.running}
          paused={downloadState.paused}
          finished={downloadState.finished}
          onPause={handlePause}
          onStop={handleStop}
          onReauth={handleReauth}
        />
      ),
      disabled: !isPlatformLoggedIn,
    },
  ];

  const handleLibraryLoginSuccess = () => {
    setIsLibraryLoggedIn(true);
    setLoggedInLibraryPlatform(selectedLibraryPlatform);
    setLibraryTab('books');
  };

  const handleLibraryLogout = () => {
    setIsLibraryLoggedIn(false);
    setLoggedInLibraryPlatform('');
    setLibraryTab('login');
    setDownloadingBooks(new Set()); // Clear downloading state
  };

  const showNotification = (
    message: string,
    type: 'success' | 'info' = 'info'
  ) => {
    const id = Date.now().toString();
    setDownloadNotifications((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setDownloadNotifications((prev) =>
        prev.filter((notif) => notif.id !== id)
      );
    }, 4000);
  };

  const handleBookDownload = async (book: Book) => {
    // Add book to downloading set
    setDownloadingBooks((prev) => new Set(prev).add(book.id));

    // Show download started message
    showNotification(t('downloadStarted', { title: book.title }), 'info');

    // Mock download process (3 seconds)
    setTimeout(() => {
      // Remove book from downloading set
      setDownloadingBooks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });

      // Show download completed message
      showNotification(
        t('downloadCompleted', { title: book.title }),
        'success'
      );
    }, 3000);
  };

  const LibraryLoginContent = () => {
    const [libLoginMethod, setLibLoginMethod] = useState<
      'credentials' | 'cookies'
    >('credentials');
    const [libCookiesFile, setLibCookiesFile] = useState<File | null>(null);
    const [libUseSelenium, setLibUseSelenium] = useState(false);
    const [libUsername, setLibUsername] = useState('');
    const [libPassword, setLibPassword] = useState('');
    const [libBaseUrl, setLibBaseUrl] = useState('');
    const [libLoginUrl, setLibLoginUrl] = useState('');
    const [libError, setLibError] = useState<string | null>(null);
    const [libIsLoading, setLibIsLoading] = useState(false);

    const handleLibraryLogin = async () => {
      setLibIsLoading(true);
      setLibError(null);
      // Mock login - always succeed after 800ms
      setTimeout(() => {
        handleLibraryLoginSuccess();
        setLibIsLoading(false);
      }, 800);
    };

    const handle2FALibLogin = () => {
      alert('Use Cookies file instead');
    };

    const selectedLibPlatform = libraryPlatforms.find(
      (p) => p.id === selectedLibraryPlatform
    );

    return (
      <div className="space-y-4">
        <div>
          <label
            htmlFor="libraryPlatform"
            className="block text-sm font-medium text-gray-700"
          >
            {tPlatform('libraryPlatform')}
          </label>
          <select
            id="libraryPlatform"
            value={selectedLibraryPlatform}
            onChange={(e) => setSelectedLibraryPlatform(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-lg shadow-sm transition"
          >
            {libraryPlatforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>

        {selectedLibPlatform?.needsLoginUrl && (
          <div>
            <label
              htmlFor="libLoginUrl"
              className="block text-sm font-medium text-gray-700"
            >
              {selectedLibPlatform.loginUrlLabel || 'Login URL'}
            </label>
            <input
              type="text"
              id="libLoginUrl"
              value={libLoginUrl}
              onChange={(e) => setLibLoginUrl(e.target.value)}
              className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition"
            />
          </div>
        )}

        {selectedLibPlatform?.needsBaseUrl && (
          <div>
            <label
              htmlFor="libBaseUrl"
              className="block text-sm font-medium text-gray-700"
            >
              {selectedLibPlatform.baseUrlLabel || 'Base URL (optional)'}
            </label>
            <input
              type="text"
              id="libBaseUrl"
              value={libBaseUrl}
              onChange={(e) => setLibBaseUrl(e.target.value)}
              className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tPlatform('loginMethod')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="librariesLoginMethod"
                value="credentials"
                checked={libLoginMethod === 'credentials'}
                onChange={(e) =>
                  setLibLoginMethod(e.target.value as 'credentials' | 'cookies')
                }
                className="mr-2"
              />
              <span className="text-sm">{tPlatform('usernamePassword')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="librariesLoginMethod"
                value="cookies"
                checked={libLoginMethod === 'cookies'}
                onChange={(e) =>
                  setLibLoginMethod(e.target.value as 'credentials' | 'cookies')
                }
                className="mr-2"
              />
              <span className="text-sm">{tPlatform('cookiesFile')}</span>
            </label>
          </div>
          {libLoginMethod === 'cookies' && (
            <p className="text-xs text-blue-600 mt-1">
              {tPlatform('cookiesFileDescription')}
            </p>
          )}
        </div>

        {libLoginMethod === 'credentials' ? (
          <>
            <div>
              <label
                htmlFor="libUsername"
                className="block text-sm font-medium text-gray-700"
              >
                {t('usernameOrEmail')}
              </label>
              <input
                type="text"
                id="libUsername"
                value={libUsername}
                onChange={(e) => setLibUsername(e.target.value)}
                className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition"
              />
            </div>

            <div>
              <label
                htmlFor="libPassword"
                className="block text-sm font-medium text-gray-700"
              >
                {t('password')}
              </label>
              <input
                type="password"
                id="libPassword"
                value={libPassword}
                onChange={(e) => setLibPassword(e.target.value)}
                className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition"
              />
            </div>
          </>
        ) : (
          <div>
            <label
              htmlFor="libCookiesFile"
              className="block text-sm font-medium text-gray-700"
            >
              {tPlatform('cookiesFileLabel')}
            </label>
            <input
              type="file"
              id="libCookiesFile"
              accept=".txt,.cookies"
              onChange={(e) => setLibCookiesFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
            />
            {libCookiesFile && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {libCookiesFile.name}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="libUseSelenium"
            checked={libUseSelenium}
            onChange={(e) => setLibUseSelenium(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="libUseSelenium" className="text-sm">
            {tPlatform('seleniumAuth')}
          </label>
        </div>
        <p className="text-xs text-gray-500">
          {tPlatform('seleniumAuthDescription')}
        </p>

        {libError && <p className="text-red-500 text-sm">{libError}</p>}

        <div className="flex space-x-3">
          <AppButton
            onClick={handleLibraryLogin}
            disabled={
              libIsLoading ||
              !selectedLibraryPlatform ||
              (selectedLibPlatform?.needsLoginUrl ? !libLoginUrl : false) ||
              (selectedLibPlatform?.needsBaseUrl ? !libBaseUrl : false) ||
              (libLoginMethod === 'credentials'
                ? !libUsername || !libPassword
                : !libCookiesFile)
            }
          >
            {libIsLoading ? t('loggingIn') : t('login')}
          </AppButton>

          <AppButton onClick={handle2FALibLogin} disabled={false}>
            {tPlatform('2faSupported')}
          </AppButton>
        </div>
      </div>
    );
  };

  const LibraryBooksContent = () => {
    const loggedInPlatform = libraryPlatforms.find(
      (p) => p.id === loggedInLibraryPlatform
    );

    return (
      <div className="space-y-4">
        {loggedInPlatform && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>{t('connectedTo')}</strong> {loggedInPlatform.name}
            </p>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={bookSearchQuery}
            onChange={(e) => setBookSearchQuery(e.target.value)}
            className="flex-1 bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm sm:text-sm rounded-lg transition px-4 py-2"
          />
          <AppButton onClick={handleLibraryLogout} disabled={false}>
            {t('logout')}
          </AppButton>
        </div>

        <div className="space-y-4">
          {books.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              {bookSearchQuery
                ? t('noBooks')
                : `${t('noBooksAvailable')} ${loggedInPlatform?.name || 'this platform'}`}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                {t('showingBooks', {
                  count: books.length,
                  plural: books.length !== 1 ? 's' : '',
                })}{' '}
                {loggedInPlatform?.name}
              </p>
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onDownload={handleBookDownload}
                  downloadText={
                    downloadingBooks.has(book.id)
                      ? t('downloading')
                      : t('downloadBook')
                  }
                  isDownloading={downloadingBooks.has(book.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const LibrariesContent = () => {
    const libraryTabs = [
      {
        id: 'login',
        label: t('libraryLoginTab'),
        content: <LibraryLoginContent />,
        disabled: isLibraryLoggedIn,
      },
      {
        id: 'books',
        label: t('libraryBooksTab'),
        content: <LibraryBooksContent />,
        disabled: !isLibraryLoggedIn,
      },
    ];

    return (
      <Tabs
        tabs={libraryTabs}
        activeTab={libraryTab}
        onTabChange={setLibraryTab}
      />
    );
  };

  const mainTabs = [
    {
      id: 'courses',
      label: t('coursesTab'),
      content: (
        <Tabs
          tabs={platformTabs}
          activeTab={platformTab}
          onTabChange={setPlatformTab}
        />
      ),
    },
    {
      id: 'libraries',
      label: t('librariesTab'),
      content: <LibrariesContent />,
    },
    {
      id: 'schedule-tasks',
      label: t('scheduleTasksTab'),
      content: (
        <div className="text-center text-gray-400 py-8">
          {t('scheduleTasksComingSoon')}
        </div>
      ),
    },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
      <Header />
      <main className="flex-1 flex justify-center items-start py-4 px-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 md:p-8 my-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">
              {t('title')}
            </h1>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-sm transition"
              aria-label={tCommon('logout')}
            >
              {tCommon('logout')}
            </button>
          </div>
          <Tabs tabs={mainTabs} activeTab={mainTab} onTabChange={setMainTab} />
        </div>
      </main>

      {/* Download Notifications */}
      {downloadNotifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {downloadNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${
                notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
              } text-white px-4 py-3 rounded-lg shadow-lg max-w-sm animate-slide-in-right`}
            >
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <span className="text-sm">{notification.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
