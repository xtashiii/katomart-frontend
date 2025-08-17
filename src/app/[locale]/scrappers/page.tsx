'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/auth';
import Header from '@/components/Header';
import Tabs from '@/components/Tabs';
import PlatformSettings from '@/components/PlatformSettings';
import CourseList from '@/components/CourseList';
import DownloadSettings from '@/components/DownloadSettings';
import DownloadProgress from '@/components/DownloadProgress';

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

export default function ScrappersPage() {
  const t = useTranslations('scrappers');
  const tCommon = useTranslations('buttons');
  const tPlatform = useTranslations('platform');
  const tDownload = useTranslations('download');
  const tProgress = useTranslations('progress');
  const tGeneral = useTranslations('general');
  const params = useParams();
  const locale = params?.locale as string | undefined;
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [mainTab, setMainTab] = useState('platforms');
  const [platformTab, setPlatformTab] = useState('settings');
  const [isPlatformLoggedIn, setIsPlatformLoggedIn] = useState(false);

  // Persisted state for all tabs
  const [courses, setCourses] = useState<Course[]>([]); // course/module/lesson tree
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({}); // selection state
  const [downloadConfig, setDownloadConfig] = useState<{ downloadPath: string; createSubfolders: boolean }>({ downloadPath: '', createSubfolders: true });
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

    checkAuth();
  }, [isLoggedIn, logout, router]);

  const handleLoginSuccess = () => {
    setIsPlatformLoggedIn(true);
    setPlatformTab('courses');
  };

  const handleLogout = () => {
    setIsPlatformLoggedIn(false);
    setPlatformTab('settings');
    setCourses([]);
    setSelectedItems({});
    setDownloadConfig({ downloadPath: '', createSubfolders: true });
    setDownloadState({ running: false, paused: false, progress: {}, finished: false });
  };

  // Download workflow
  const handleStartDownload = (config: { downloadPath: string; createSubfolders: boolean }) => {
    setDownloadConfig(config);
    setDownloadState({ running: true, paused: false, progress: {}, finished: false });
    setPlatformTab('progress');
    // Simulate download progress
    simulateDownload();
  };

  // Simulate download progress for each lesson
  const simulateDownload = () => {
    if (!courses.length) return;
    const allLessonIds: string[] = [];
    courses.forEach((course: Course) => course.modules.forEach((mod: Module) => mod.lessons.forEach((les: Lesson) => allLessonIds.push(les.id))));
    let progress: Record<string, number> = {};
    let idx = 0;
    function step() {
      if (idx >= allLessonIds.length) {
        setDownloadState(ds => ({ ...ds, running: false, finished: true }));
        return;
      }
      const id = allLessonIds[idx];
      progress = { ...progress, [id]: 100 };
      setDownloadState(ds => ({ ...ds, progress: { ...progress } }));
      idx++;
      setTimeout(step, 600);
    }
    step();
  };

  const handlePause = () => setDownloadState(ds => ({ ...ds, paused: !ds.paused }));
  const handleStop = () => setDownloadState(ds => ({ running: false, paused: false, progress: {}, finished: false }));
  const handleReauth = () => setPlatformTab('settings');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <Header />
        <main className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-lg flex flex-col items-center">
            <div className="animate-pulse text-lg text-gray-500">{tGeneral('loading')}</div>
          </div>
        </main>
      </div>
    );
  }

  const platformTabs = [
  { id: 'settings', label: tPlatform('settings'), content: <PlatformSettings onLoginSuccess={handleLoginSuccess} />, disabled: isPlatformLoggedIn || downloadState.running },
  { id: 'courses', label: t('coursesTab'), content: <CourseList isLoggedIn={isPlatformLoggedIn} courses={courses} setCourses={setCourses} selectedItems={selectedItems} setSelectedItems={setSelectedItems} onLogout={handleLogout} />, disabled: !isPlatformLoggedIn || downloadState.running },
  { id: 'download-settings', label: tDownload('settings'), content: <DownloadSettings onStart={handleStartDownload} config={downloadConfig} setConfig={setDownloadConfig} disabled={downloadState.running} />, disabled: !isPlatformLoggedIn || downloadState.running },
  { id: 'progress', label: tProgress('progress'), content: <DownloadProgress courses={courses} selectedItems={selectedItems} progress={downloadState.progress} running={downloadState.running} paused={downloadState.paused} finished={downloadState.finished} onPause={handlePause} onStop={handleStop} onReauth={handleReauth} />, disabled: !isPlatformLoggedIn || !downloadState.running },
  ];

  const mainTabs = [
  { id: 'platforms', label: t('platformsTab'), content: <Tabs tabs={platformTabs} activeTab={platformTab} onTabChange={setPlatformTab} /> },
  { id: 'libraries', label: t('librariesTab'), content: <div className="text-center text-gray-400 py-8">{t('librariesComingSoon')}</div> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Header />
      <main className="flex justify-center py-10">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8 md:p-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">{t('title')}</h1>
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
    </div>
  );
}
