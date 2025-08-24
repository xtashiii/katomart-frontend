'use client';
import React from 'react';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/auth';
import Header from '@/components/Header';

// Type definitions
interface LogEntry {
  time: string;
  message: string;
}

interface TelegramGroup {
  id: string;
  name: string;
}

interface TelegramAccount {
  id: string;
  username: string;
  groups: TelegramGroup[];
}

interface RcloneCloud {
  id: string;
  profile: string;
  service: string;
  configValid: boolean;
  totalSize?: string;
  backupSize?: string;
}

interface DownloadedMaterial {
  id: string;
  name: string;
  size: string;
}

interface Backup {
  id: string;
  material: string;
  cloud: string;
  type: string;
  zip: string;
  zipSize: string;
  date: string;
}

interface Category {
  id: number;
  name: string;
}

interface CourseNote {
  id: string;
  name: string;
  notes: number;
}

interface ZipPreset {
  value: string;
  label: string;
}

interface DownloadConfigTab {
  id: string;
  label: string;
}

export default function AdminPage() {
  // --- Pending Delete Rclone State (must be at top level for hooks order) ---
  const [pendingDeleteRclone, setPendingDeleteRclone] = useState<string | null>(
    null
  );
  const [pendingDeleteProfile, setPendingDeleteProfile] = useState<
    string | null
  >(null);
  // --- Backup Management SubTabs State and Mock Data ---
  // const [backupSubTab, setBackupSubTab] = useState<'create' | 'list'>('create');
  const [backups, setBackups] = useState<Backup[]>([]);
  const t = useTranslations('admin');
  // --- All hooks at the top, before any conditional return ---
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('system-log');
  const [authSubTab, setAuthSubTab] = useState('telegram');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [telegramAccounts, setTelegramAccounts] = useState<TelegramAccount[]>(
    []
  );

  const [rcloneClouds, setRcloneClouds] = useState<RcloneCloud[]>([]);

  // --- Backup Management Tab state ---
  const [downloadedMaterials, setDownloadedMaterials] = useState<
    DownloadedMaterial[]
  >([]);
  const [selectedMaterial, setSelectedMaterial] = useState('mat1');
  const [selectedCloud, setSelectedCloud] = useState('rc1');
  const [backupType, setBackupType] = useState('mirror');
  const [zipType, setZipType] = useState('none');
  const [zipPreset, setZipPreset] = useState('1gb');

  // --- Cognitahz Config Tab State ---
  const [mediaServer, setMediaServer] = useState('http://localhost:6102');
  const [authType, setAuthType] = useState('userpass');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [jwt, setJwt] = useState('');
  // --- Media Server Instance Settings ---
  const [mediaServerInstanceEnabled, setMediaServerInstanceEnabled] =
    useState(false);
  const [requireLogin, setRequireLogin] = useState(true);
  const [requireUsernameMatch, setRequireUsernameMatch] = useState(false);
  // --- Cognitahz SubTab State (must be at top level for hooks order) ---
  const [cognitahzSubTab, setCognitahzSubTab] = useState('media-server');
  // --- Local Platform Category Editor State (must be at top level for hooks order) ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  // --- Download Config SubTabs State (must be at top level for hooks order) ---
  const [downloadConfigSubTab, setDownloadConfigSubTab] =
    useState('file-system');
  const [downloadConfigTabs, setDownloadConfigTabs] = useState<
    DownloadConfigTab[]
  >([]);
  const [zipPresets, setZipPresets] = useState<ZipPreset[]>([]);
  const [courseNotes, setCourseNotes] = useState<CourseNote[]>([]);

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

    const loadAdminData = async () => {
      try {
        // Load all admin data from mock API
        const [
          logsRes,
          telegramRes,
          rcloneRes,
          materialsRes,
          backupsRes,
          categoriesRes,
          courseNotesRes,
          zipPresetsRes,
          configTabsRes,
        ] = await Promise.all([
          fetch('/api/admin/system-logs'),
          fetch('/api/admin/telegram-accounts'),
          fetch('/api/admin/rclone-clouds'),
          fetch('/api/admin/downloaded-materials'),
          fetch('/api/admin/backups'),
          fetch('/api/admin/categories'),
          fetch('/api/admin/course-notes'),
          fetch('/api/admin/zip-presets'),
          fetch('/api/admin/download-config-tabs'),
        ]);

        const [
          logsData,
          telegramData,
          rcloneData,
          materialsData,
          backupsData,
          categoriesData,
          courseNotesData,
          zipPresetsData,
          configTabsData,
        ] = await Promise.all([
          logsRes.json(),
          telegramRes.json(),
          rcloneRes.json(),
          materialsRes.json(),
          backupsRes.json(),
          categoriesRes.json(),
          courseNotesRes.json(),
          zipPresetsRes.json(),
          configTabsRes.json(),
        ]);

        setLogs(logsData.logs || []);
        setTelegramAccounts(telegramData.accounts || []);
        setRcloneClouds(rcloneData.clouds || []);
        setDownloadedMaterials(materialsData.materials || []);
        setBackups(backupsData.backups || []);
        setCategories(categoriesData.categories || []);
        setCourseNotes(courseNotesData.courseNotes || []);
        setZipPresets(zipPresetsData.presets || []);
        setDownloadConfigTabs(
          configTabsData.tabs?.map((tab: { id: string; label: string }) => ({
            id: tab.id,
            label:
              tab.id === 'file-system'
                ? t('fileSystem')
                : tab.id === 'yt-dlp'
                  ? t('ytDlp')
                  : tab.id === 'media-types'
                    ? t('mediaTypes')
                    : tab.id === 'media-decryption'
                      ? t('mediaDecryption')
                      : tab.id === 'video-postprocessing'
                        ? t('videoPostprocessing')
                        : t(tab.label),
          })) || []
        );

        // Set initial selections based on loaded data
        if (materialsData.materials?.length > 0) {
          setSelectedMaterial(materialsData.materials[0].id);
        }
        if (rcloneData.clouds?.length > 0) {
          setSelectedCloud(rcloneData.clouds[0].id);
        }
      } catch (error) {
        console.error('Failed to load admin data:', error);
      }
    };

    checkAuth();
    loadAdminData();
  }, [isLoggedIn, logout, router, t]);

  // --- Pending Delete Rclone State (must be at top level for hooks order) ---

  // --- Backup Create Tab (i18n) ---
  // const BackupCreateTab = () => (
  <form
    style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    onSubmit={(e) => e.preventDefault()}
  >
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontWeight: 500 }}>{t('materialToBackup')}</label>
        <select
          className="app-button"
          style={{ width: '100%', marginTop: 8 }}
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
        >
          {downloadedMaterials.map((mat) => (
            <option key={mat.id} value={mat.id}>
              {mat.name} ({mat.size})
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontWeight: 500 }}>{t('destinationCloud')}</label>
        <select
          className="app-button"
          style={{ width: '100%', marginTop: 8 }}
          value={selectedCloud}
          onChange={(e) => setSelectedCloud(e.target.value)}
        >
          {rcloneClouds.map((cloud) => (
            <option key={cloud.id} value={cloud.id}>
              {cloud.profile} ({cloud.service})
            </option>
          ))}
        </select>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontWeight: 500 }}>{t('backupType')}</label>
        <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
          <label>
            <input
              type="radio"
              name="backupType"
              value="mirror"
              checked={backupType === 'mirror'}
              onChange={() => setBackupType('mirror')}
            />{' '}
            {t('mirror', { default: 'Mirror (copy only)' })}
          </label>
          <label>
            <input
              type="radio"
              name="backupType"
              value="move"
              checked={backupType === 'move'}
              onChange={() => setBackupType('move')}
            />{' '}
            {t('move', { default: 'Move (copy & free disk)' })}
          </label>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontWeight: 500 }}>{t('zipType')}</label>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="radio"
              name="zipType"
              value="none"
              checked={zipType === 'none'}
              onChange={() => setZipType('none')}
            />
            <span>{t('noZip', { default: 'No Zip' })}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="radio"
              name="zipType"
              value="single"
              checked={zipType === 'single'}
              onChange={() => setZipType('single')}
            />
            <span>{t('singleZip', { default: 'Single Zip' })}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="radio"
              name="zipType"
              value="split"
              checked={zipType === 'split'}
              onChange={() => setZipType('split')}
            />
            <span>{t('splitZip', { default: 'Split Zip' })}</span>
            {zipType === 'split' && (
              <select
                className="app-button"
                style={{ marginLeft: 8, width: 120 }}
                value={zipPreset}
                onChange={(e) => setZipPreset(e.target.value)}
              >
                {zipPresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
      <button
        className="app-button"
        style={{ background: '#2196f3', color: 'white' }}
      >
        {t('startBackup', { default: 'Start Backup' })}
      </button>
      <button
        className="app-button"
        style={{ background: '#4caf50', color: 'white' }}
      >
        {t('testBackup', { default: 'Test Backup' })}
      </button>
    </div>
  </form>;
  // );
  if (isLoading) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div
            className="content-wrapper"
            style={{ textAlign: 'center', padding: '2rem' }}
          >
            <div>{t('loading')}</div>
          </div>
        </main>
      </div>
    );
  }

  // --- System Log Tab ---
  const SystemLogTab = () => (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 className="section-title" style={{ marginBottom: 16 }}>
        {t('systemLog')}
      </h2>
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid var(--border)',
          padding: 24,
          minHeight: 220,
          maxHeight: 320,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: 15,
          color: '#333',
          marginBottom: 16,
        }}
      >
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: 8, display: 'flex', gap: 12 }}>
            <span style={{ color: '#888', minWidth: 120 }}>{log.time}</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Telegram Auth SubTab ---
  const TelegramAuthTab = () => (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: 16 }}>
        {t('telegram')}
      </h3>
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 20,
          justifyContent: 'center',
        }}
      >
        <button className="app-button">{t('addPersonalAccount')}</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>{t('linkedAccounts')}</b>
        {telegramAccounts.length === 0 && (
          <div style={{ color: '#888', marginTop: 8 }}>{t('noAccounts')}</div>
        )}
        {telegramAccounts.map((acc) => (
          <div
            key={acc.id}
            style={{
              background: 'var(--background)',
              borderRadius: 10,
              margin: '16px 0',
              padding: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              border: '1px solid var(--border)',
              position: 'relative',
            }}
          >
            <button
              className="app-button"
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: '#dc3545',
                color: 'white',
                padding: '2px 10px',
                fontSize: 14,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
              }}
              title={t('removePersonalAccount')}
              // onClick={() => handleRemoveAccount(acc.id)}
            >
              &times;
            </button>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>
              @{acc.username}
            </div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>
              {t('groupsChannels')}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {acc.groups.map((g) => (
                <li key={g.id} style={{ fontSize: 15, marginBottom: 4 }}>
                  {g.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Rclone Clouds SubTab ---
  const handleDeleteRclone = (id: string, profile: string) => {
    setPendingDeleteRclone(id);
    setPendingDeleteProfile(profile);
  };
  const confirmDeleteRclone = async () => {
    if (pendingDeleteRclone) {
      try {
        const response = await fetch('/api/admin/rclone-clouds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            cloud: { id: pendingDeleteRclone },
          }),
        });
        const data = await response.json();
        if (data.success) {
          setRcloneClouds((prev) =>
            prev.filter((c) => c.id !== pendingDeleteRclone)
          );
        }
      } catch (error) {
        console.error('Failed to delete rclone cloud:', error);
      } finally {
        setPendingDeleteRclone(null);
        setPendingDeleteProfile(null);
      }
    }
  };
  const cancelDeleteRclone = () => {
    setPendingDeleteRclone(null);
    setPendingDeleteProfile(null);
  };

  const RcloneCloudsTab = () => (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: 16 }}>
        {t('rclone')}
      </h3>
      <div
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
      >
        <button className="app-button">{t('addRcloneCloud')}</button>
      </div>
      <div>
        <b>{t('cloudProfiles')}</b>
        {rcloneClouds.length === 0 && (
          <div style={{ color: '#888', marginTop: 8 }}>{t('noProfiles')}</div>
        )}
        {rcloneClouds.length > 0 && (
          <div style={{ marginTop: 16, overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 16,
              }}
            >
              <thead>
                <tr style={{ background: 'var(--background)' }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '10px 8px',
                      fontWeight: 600,
                    }}
                  >
                    {t('profile')}
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '10px 8px',
                      fontWeight: 600,
                    }}
                  >
                    {t('service')}
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '10px 8px',
                      fontWeight: 600,
                    }}
                  >
                    {t('config')}
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '10px 8px',
                      fontWeight: 600,
                    }}
                  >
                    {t('cloudSize')}
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '10px 8px',
                      fontWeight: 600,
                    }}
                  >
                    {t('backupsSize')}
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '10px 8px',
                      fontWeight: 600,
                    }}
                  >
                    {t('test')}
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '10px 8px',
                      fontWeight: 600,
                    }}
                  >
                    {t('delete')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rcloneClouds.map((cloud) => (
                  <React.Fragment key={cloud.id}>
                    <tr
                      style={{
                        background: 'var(--surface)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <td style={{ padding: '10px 8px', fontWeight: 500 }}>
                        {cloud.profile}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{cloud.service}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 8,
                            background: cloud.configValid
                              ? '#e8f5e9'
                              : '#ffebee',
                            color: cloud.configValid ? '#388e3c' : '#c62828',
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {cloud.configValid ? t('valid') : t('invalid')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        {cloud.totalSize}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        {cloud.backupSize}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <button
                          className="app-button"
                          style={{ padding: '4px 14px', fontSize: 15 }}
                        >
                          {t('test')}
                        </button>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <button
                          className="app-button"
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            padding: '4px 10px',
                            fontSize: 15,
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          title={t('removeRcloneCloud', {
                            default: 'Remove cloud',
                          })}
                          onClick={() =>
                            handleDeleteRclone(cloud.id, cloud.profile)
                          }
                          disabled={pendingDeleteRclone !== null}
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                    {pendingDeleteRclone === cloud.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0 }}>
                          <div
                            style={{
                              background: '#fff3cd',
                              color: '#856404',
                              border: '1px solid #ffeeba',
                              borderRadius: 8,
                              margin: 12,
                              padding: '18px 24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: 16,
                            }}
                          >
                            <span>
                              {t('warningDeleteCloud', {
                                profile: pendingDeleteProfile || '',
                              })}
                            </span>
                            <span>
                              <button
                                className="app-button"
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  marginRight: 12,
                                }}
                                onClick={confirmDeleteRclone}
                              >
                                {t('yesRemove')}
                              </button>
                              <button
                                className="app-button"
                                style={{ background: '#eee', color: '#333' }}
                                onClick={cancelDeleteRclone}
                              >
                                {t('cancel')}
                              </button>
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // --- Authentication Config Tab ---
  const AuthConfigTab = () => (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div
        className="flex border-b border-gray-200 mb-4"
        style={{ gap: 0, justifyContent: 'space-between' }}
      >
        <button
          className={`py-3 px-8 text-lg font-semibold border-b-4 transition-all duration-150 ${authSubTab === 'telegram' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-100'}`}
          style={{ flex: 1, borderRadius: '8px 8px 0 0', marginRight: 4 }}
          onClick={() => setAuthSubTab('telegram')}
        >
          {t('telegram')}
        </button>
        <button
          className={`py-3 px-8 text-lg font-semibold border-b-4 transition-all duration-150 ${authSubTab === 'rclone' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-100'}`}
          style={{ flex: 1, borderRadius: '8px 8px 0 0', marginLeft: 4 }}
          onClick={() => setAuthSubTab('rclone')}
        >
          {t('rclone')}
        </button>
      </div>
      <div>
        {authSubTab === 'telegram' && <TelegramAuthTab />}
        {authSubTab === 'rclone' && <RcloneCloudsTab />}
      </div>
    </div>
  );

  // --- Backup Management Tab ---
  // (state already declared at the top)

  // --- Backup Management SubTabs State and Mock Data ---
  // (state already declared at the top)

  // const BackupListTab = () => (
  <div
    style={{
      marginTop: 16,
      maxWidth: 900,
      marginLeft: 'auto',
      marginRight: 'auto',
    }}
  >
    {backups.length === 0 && (
      <div style={{ color: '#888', textAlign: 'center' }}>
        {t('noBackupsFound')}
      </div>
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {backups.map((b) => (
        <div
          key={b.id}
          style={{
            background: 'var(--surface)',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid var(--border)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <div style={{ flex: 2, minWidth: 180 }}>
              <b>{t('material')}:</b> {b.material}
            </div>
            <div style={{ flex: 2, minWidth: 180 }}>
              <b>{t('cloud')}:</b> {b.cloud}
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <b>{t('type')}:</b> {b.type}
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <b>{t('zip')}:</b> {b.zip}
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <b>{t('splitSize')}:</b> {b.zipSize}
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <b>{t('date')}:</b> {b.date}
            </div>
          </div>
          <div
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="app-button"
                style={{ background: '#2196f3', color: 'white' }}
              >
                {t('retrieveMirror')}
              </button>
              <button
                className="app-button"
                style={{ background: '#2196f3', color: 'white' }}
              >
                {t('retrieveMove')}
              </button>
            </div>
            <button
              className="app-button"
              style={{ background: '#4caf50', color: 'white' }}
            >
              {t('test')}
            </button>
            <button
              className="app-button"
              style={{ background: '#f44336', color: 'white' }}
            >
              {t('delete')}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>;
  // );

  /*
  const BackupTab = () => (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: 24 }}>{t('backupManagement')}</h3>
      <div className="flex border-b border-gray-200 mb-4" style={{ gap: 0 }}>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 ${backupSubTab === 'create' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setBackupSubTab('create')}
        >{t('createBackup')}</button>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 ${backupSubTab === 'list' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setBackupSubTab('list')}
        >{t('existingBackups')}</button>
      </div>
      <div>
        {backupSubTab === 'create' && <BackupCreateTab />}
        {backupSubTab === 'list' && <BackupListTab />}
      </div>
    </div>
  );
  */

  const handleAddCategory = async () => {
    if (newCategory.trim() === '') return;
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          category: { name: newCategory.trim() },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.category]);
        setNewCategory('');
      }
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', category: { id } }),
      });
      const data = await response.json();
      if (data.success) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const CognitahzConfigTab = () => (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: 24 }}>
        {t('cognitahz')}
      </h3>
      <div
        className="flex border-b border-gray-200 mb-4"
        style={{ gap: 0, justifyContent: 'space-between' }}
      >
        <button
          className={`py-3 px-8 text-lg font-semibold border-b-4 transition-all duration-150 ${cognitahzSubTab === 'media-server' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-100'}`}
          style={{ flex: 1, borderRadius: '8px 8px 0 0', marginRight: 4 }}
          onClick={() => setCognitahzSubTab('media-server')}
        >
          {t('mediaServer')}
        </button>
        <button
          className={`py-3 px-8 text-lg font-semibold border-b-4 transition-all duration-150 ${cognitahzSubTab === 'local-platform' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-100'}`}
          style={{ flex: 1, borderRadius: '8px 8px 0 0', marginLeft: 4 }}
          onClick={() => setCognitahzSubTab('local-platform')}
        >
          {t('localPlatform')}
        </button>
      </div>
      <div>
        {cognitahzSubTab === 'media-server' && (
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Media Server Connection Settings */}
            <div
              style={{
                background: '#f8fafc',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h4
                style={{
                  marginBottom: 20,
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1a237e',
                }}
              >
                {t('connectionSettings')}
              </h4>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <div>
                  <label style={{ fontWeight: 500 }}>
                    {t('mediaServerUrl')}
                  </label>
                  <input
                    type="text"
                    className="app-button"
                    style={{
                      width: '100%',
                      marginTop: 8,
                      color: '#222',
                      background: '#fff',
                    }}
                    value={mediaServer}
                    onChange={(e) => setMediaServer(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontWeight: 500,
                      marginBottom: 8,
                      display: 'block',
                    }}
                  >
                    {t('authType')}
                  </label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <label
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <input
                        type="radio"
                        name="authType"
                        value="userpass"
                        checked={authType === 'userpass'}
                        onChange={() => setAuthType('userpass')}
                      />
                      {t('username')}/{t('password')}
                    </label>
                    <label
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <input
                        type="radio"
                        name="authType"
                        value="jwt"
                        checked={authType === 'jwt'}
                        onChange={() => setAuthType('jwt')}
                      />
                      JWT
                    </label>
                  </div>
                </div>
                {authType === 'userpass' && (
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 500 }}>{t('username')}</label>
                      <input
                        type="text"
                        className="app-button"
                        style={{
                          width: '100%',
                          marginTop: 8,
                          color: '#222',
                          background: '#fff',
                        }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 500 }}>{t('password')}</label>
                      <input
                        type="password"
                        className="app-button"
                        style={{
                          width: '100%',
                          marginTop: 8,
                          color: '#222',
                          background: '#fff',
                        }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {authType === 'jwt' && (
                  <div>
                    <label style={{ fontWeight: 500 }}>{t('jwtToken')}</label>
                    <input
                      type="text"
                      className="app-button"
                      style={{
                        width: '100%',
                        marginTop: 8,
                        color: '#222',
                        background: '#fff',
                      }}
                      value={jwt}
                      onChange={(e) => setJwt(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Media Server Instance Settings */}
            <div
              style={{
                background: '#f0f9ff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #bae6fd',
              }}
            >
              <h4
                style={{
                  marginBottom: 20,
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1a237e',
                }}
              >
                {t('mediaServerInstance')}
              </h4>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={mediaServerInstanceEnabled}
                    onChange={(e) =>
                      setMediaServerInstanceEnabled(e.target.checked)
                    }
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  {t('enableMediaServerInstance')}
                </label>

                {mediaServerInstanceEnabled && (
                  <div
                    style={{
                      marginLeft: 30,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontWeight: 500,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={requireLogin}
                        onChange={(e) => setRequireLogin(e.target.checked)}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      {t('requireLogin')}
                    </label>

                    {requireLogin && (
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          fontWeight: 500,
                          marginLeft: 28,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={requireUsernameMatch}
                          onChange={(e) =>
                            setRequireUsernameMatch(e.target.checked)
                          }
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                        {t('requireUsernameMatch')}
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 8,
                gap: 16,
              }}
            >
              <button
                className="app-button"
                style={{ background: '#4caf50', color: 'white', minWidth: 180 }}
              >
                {t('testConnection')}
              </button>
              <button
                className="app-button"
                style={{ background: '#1976d2', color: 'white', minWidth: 180 }}
              >
                {t('saveMediaServerConfig')}
              </button>
            </div>
          </form>
        )}
        {cognitahzSubTab === 'local-platform' && (
          <div
            style={{
              padding: '2rem 1rem',
              maxWidth: 1400,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 32,
              alignItems: 'start',
              background:
                'linear-gradient(135deg, #f8fafc 0%, #f3f6fb 50%, #eef2f7 100%)',
              borderRadius: 16,
              boxShadow: '0 4px 20px 0 rgba(60,80,120,0.08)',
            }}
          >
            {/* Categories Card */}
            <div
              style={{
                width: '100%',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 3px 16px 0 rgba(60,80,120,0.08)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                minWidth: 0,
                border: '1px solid rgba(226, 232, 240, 0.6)',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <h4
                style={{
                  marginBottom: 18,
                  fontSize: 21,
                  fontWeight: 700,
                  color: '#1a237e',
                  letterSpacing: 0.2,
                }}
              >
                {t('categories')}
              </h4>
              <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                <input
                  type="text"
                  className="app-button"
                  placeholder={t('addNewCategory')}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    padding: '10px 14px',
                    background: '#f5f7fa',
                    color: '#222',
                    border: '1px solid #e0e4ea',
                    borderRadius: 7,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <button
                  className="app-button"
                  style={{
                    background:
                      'linear-gradient(90deg,#1976d2 60%,#2196f3 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 16,
                    padding: '10px 22px',
                    borderRadius: 7,
                    boxShadow: '0 2px 8px 0 rgba(25,118,210,0.08)',
                  }}
                  onClick={handleAddCategory}
                >
                  {t('add')}
                </button>
              </div>
              <div
                style={{
                  maxHeight: 350,
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  background: '#f8fafc',
                  padding: '0 0.5rem',
                  boxShadow: 'inset 0 1px 3px 0 rgba(60,80,120,0.05)',
                }}
              >
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {categories.length === 0 && (
                    <li
                      style={{
                        color: '#888',
                        fontSize: 16,
                        padding: '20px 12px',
                        textAlign: 'center',
                        fontStyle: 'italic',
                      }}
                    >
                      {t('noCategoriesYet')}
                    </li>
                  )}
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                          color: '#222',
                          fontWeight: 500,
                          flex: 1,
                        }}
                      >
                        {cat.name}
                      </span>
                      <button
                        className="app-button"
                        style={{
                          background:
                            'linear-gradient(90deg,#f44336 60%,#e57373 100%)',
                          color: 'white',
                          fontSize: 14,
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontWeight: 500,
                          boxShadow: '0 2px 6px 0 rgba(244,67,54,0.15)',
                          minWidth: 80,
                          textAlign: 'center',
                        }}
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        {t('delete')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Course Notes Card */}
            <div
              style={{
                width: '100%',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 3px 16px 0 rgba(60,80,120,0.08)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                minWidth: 0,
                border: '1px solid rgba(226, 232, 240, 0.6)',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <h4
                style={{
                  marginBottom: 18,
                  fontSize: 21,
                  fontWeight: 700,
                  color: '#1a237e',
                  letterSpacing: 0.2,
                }}
              >
                {t('courseNotes')}
              </h4>
              <div style={{ marginBottom: 20, color: '#4b5563', fontSize: 16 }}>
                {t('courseNotesDescription')}
              </div>
              <div
                style={{
                  maxHeight: 350,
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  background: '#f8fafc',
                  boxShadow: 'inset 0 1px 3px 0 rgba(60,80,120,0.05)',
                }}
              >
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {courseNotes.map((course) => (
                    <li
                      key={course.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 12px',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          marginRight: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            color: '#222',
                            fontWeight: 500,
                          }}
                        >
                          {course.name}
                        </span>
                        <span
                          style={{
                            color: course.notes > 0 ? '#1976d2' : '#aaa',
                            fontWeight: 600,
                            fontSize: 14,
                            marginTop: 4,
                          }}
                        >
                          {course.notes} {t('notes')}
                        </span>
                      </div>
                      <button
                        className="app-button"
                        style={{
                          background:
                            course.notes > 0
                              ? 'linear-gradient(90deg,#1976d2 60%,#2196f3 100%)'
                              : '#e2e8f0',
                          color: course.notes > 0 ? 'white' : '#888',
                          fontSize: 14,
                          padding: '8px 16px',
                          borderRadius: 6,
                          fontWeight: 500,
                          boxShadow:
                            course.notes > 0
                              ? '0 2px 6px 0 rgba(25,118,210,0.15)'
                              : 'none',
                          cursor: course.notes > 0 ? 'pointer' : 'not-allowed',
                          minWidth: 120,
                          textAlign: 'center',
                        }}
                        disabled={course.notes === 0}
                        title={
                          course.notes === 0
                            ? t('noNotesToDownload')
                            : t('downloadPdfTooltip')
                        }
                      >
                        {t('downloadPdf')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // --- Download Config Tab ---
  const DownloadConfigTab = () => (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: 24 }}>
        {t('downloadConfig')}
      </h3>
      <div
        className="flex border-b border-gray-200 mb-4"
        style={{ gap: 0, justifyContent: 'space-between' }}
      >
        {downloadConfigTabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-3 px-8 text-lg font-semibold border-b-4 transition-all duration-150 ${downloadConfigSubTab === tab.id ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-100'}`}
            style={{ flex: 1, borderRadius: '8px 8px 0 0', margin: '0 2px' }}
            onClick={() => setDownloadConfigSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px 0 rgba(60,80,120,0.06)',
          padding: '2.5rem 2rem',
          minHeight: 220,
          marginTop: 8,
        }}
      >
        {downloadConfigSubTab === 'file-system' && (
          <form
            style={{
              maxWidth: 700,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div
              style={{
                marginBottom: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <label
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                {t('maxPathLength')}
              </label>
              <input
                type="number"
                className="app-button"
                style={{
                  width: 180,
                  background: '#fff',
                  color: '#222',
                  fontSize: 15,
                  padding: '8px 12px',
                  marginBottom: 8,
                }}
                min="50"
                max="300"
                placeholder="260"
              />
              <span
                style={{ color: '#b71c1c', fontSize: 14, textAlign: 'center' }}
              >
                {t('windowsPathWarning')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600 }}>
                  {t('maxCourseNameLength')}
                </label>
                <input
                  type="number"
                  className="app-button"
                  style={{
                    width: '100%',
                    background: '#fff',
                    color: '#222',
                    marginTop: 8,
                  }}
                  min="10"
                  max="100"
                  placeholder="50"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600 }}>
                  {t('maxModuleNameLength')}
                </label>
                <input
                  type="number"
                  className="app-button"
                  style={{
                    width: '100%',
                    background: '#fff',
                    color: '#222',
                    marginTop: 8,
                  }}
                  min="10"
                  max="100"
                  placeholder="50"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600 }}>
                  {t('maxLessonNameLength')}
                </label>
                <input
                  type="number"
                  className="app-button"
                  style={{
                    width: '100%',
                    background: '#fff',
                    color: '#222',
                    marginTop: 8,
                  }}
                  min="10"
                  max="100"
                  placeholder="50"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600 }}>
                  {t('maxFileNameLength')}
                </label>
                <input
                  type="number"
                  className="app-button"
                  style={{
                    width: '100%',
                    background: '#fff',
                    color: '#222',
                    marginTop: 8,
                  }}
                  min="10"
                  max="100"
                  placeholder="50"
                />
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                {t('prependEnumerator')}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                {t('lessonFilesInModule')}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                {t('lessonsInCourse')}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                {t('attachmentsInFolder')}
              </label>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 18,
              }}
            >
              <button
                className="app-button"
                style={{
                  background: '#fff',
                  color: '#1976d2',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '10px 32px',
                  borderRadius: 7,
                  border: '1px solid #1976d2',
                }}
              >
                {t('saveFileSystemConfig')}
              </button>
            </div>
          </form>
        )}
        {downloadConfigSubTab === 'yt-dlp' && (
          <form
            style={{
              maxWidth: 600,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label style={{ fontWeight: 500 }}>{t('outputTemplate')}</label>
              <input
                type="text"
                className="app-button"
                style={{
                  width: '100%',
                  marginTop: 8,
                  background: '#fff',
                  color: '#222',
                }}
                placeholder="e.g. %(title)s.%(ext)s"
              />
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>{t('format')}</label>
              <input
                type="text"
                className="app-button"
                style={{
                  width: '100%',
                  marginTop: 8,
                  background: '#fff',
                  color: '#222',
                }}
                placeholder="e.g. bestvideo+bestaudio/best"
              />
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>{t('proxy')}</label>
              <input
                type="text"
                className="app-button"
                style={{
                  width: '100%',
                  marginTop: 8,
                  background: '#fff',
                  color: '#222',
                }}
                placeholder="e.g. socks5://127.0.0.1:1080"
              />
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>{t('cookiesFile')}</label>
              <input
                type="file"
                className="app-button"
                style={{
                  width: '100%',
                  marginTop: 8,
                  background: '#fff',
                  color: '#222',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>{t('retries')}</label>
                <input
                  type="number"
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                  min="1"
                  max="20"
                  placeholder="10"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>{t('sleepInterval')}</label>
                <input
                  type="number"
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                  min="0"
                  max="60"
                  placeholder="0"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>{t('threads')}</label>
                <input
                  type="number"
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                  min="1"
                  max="32"
                  placeholder="1"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>
                  {t('fragmentRetries')}
                </label>
                <input
                  type="number"
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                  min="1"
                  max="20"
                  placeholder="10"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>{t('ignoreErrors')}</label>
                <select
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                >
                  <option value="false">{t('no')}</option>
                  <option value="true">{t('yes')}</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>{t('noOverwrites')}</label>
                <select
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                >
                  <option value="false">{t('no')}</option>
                  <option value="true">{t('yes')}</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>{t('embedSubs')}</label>
                <select
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                >
                  <option value="false">{t('no')}</option>
                  <option value="true">{t('yes')}</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>{t('embedThumbnail')}</label>
                <select
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                >
                  <option value="false">{t('no')}</option>
                  <option value="true">{t('yes')}</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>{t('downloadSubs')}</label>
                <select
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                >
                  <option value="false">{t('no')}</option>
                  <option value="true">{t('yes')}</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>{t('writeInfoJson')}</label>
                <select
                  className="app-button"
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#fff',
                    color: '#222',
                  }}
                >
                  <option value="false">{t('no')}</option>
                  <option value="true">{t('yes')}</option>
                </select>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 16,
              }}
            >
              <button
                className="app-button"
                style={{
                  background: '#fff',
                  color: '#1976d2',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '10px 32px',
                  borderRadius: 7,
                  border: '1px solid #1976d2',
                }}
              >
                {t('saveYtDlpConfig')}
              </button>
            </div>
          </form>
        )}
        {downloadConfigSubTab === 'media-types' && (
          <form
            style={{
              maxWidth: 600,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div style={{ marginBottom: 8 }}>
              <label
                style={{
                  fontWeight: 600,
                  fontSize: 17,
                  display: 'block',
                  textAlign: 'center',
                  marginBottom: 10,
                }}
              >
                {t('convertMarkdownHtml')}
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: 32,
                  justifyContent: 'center',
                  marginTop: 10,
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                >
                  <input type="checkbox" style={{ width: 18, height: 18 }} />
                  {t('markdownToPdf')}
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                >
                  <input type="checkbox" style={{ width: 18, height: 18 }} />
                  {t('htmlToPdf')}
                </label>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 600, fontSize: 17 }}>
                {t('allowedMediaExtensions')}
              </label>
              <input
                type="text"
                className="app-button"
                style={{
                  width: '100%',
                  marginTop: 8,
                  background: '#fff',
                  color: '#222',
                }}
                placeholder="e.g. mp4, mp3, pdf, jpg, png, webm, mkv"
              />
              <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
                {t('allowedExtensionsHelp')}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 8,
              }}
            >
              <input
                type="checkbox"
                id="allowNonMatching"
                style={{ width: 18, height: 18 }}
              />
              <label
                htmlFor="allowNonMatching"
                style={{ fontWeight: 500, fontSize: 16, cursor: 'pointer' }}
              >
                {t('allowNonMatchingExtensions')}
              </label>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 18,
              }}
            >
              <button
                className="app-button"
                style={{
                  background: '#fff',
                  color: '#1976d2',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '10px 32px',
                  borderRadius: 7,
                  border: '1px solid #1976d2',
                }}
              >
                {t('saveMediaTypesConfig')}
              </button>
            </div>
          </form>
        )}
        {downloadConfigSubTab === 'media-decryption' && (
          <form
            style={{
              maxWidth: 600,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label
                style={{
                  fontWeight: 600,
                  fontSize: 17,
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                {t('selectDrmSources')}
              </label>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
              >
                {/* Widevine */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e0e4ea',
                    borderRadius: 8,
                    padding: '1.2rem 1.5rem',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontWeight: 500,
                      fontSize: 16,
                      marginBottom: 10,
                    }}
                  >
                    <input type="checkbox" style={{ width: 18, height: 18 }} />
                    {t('widevine')}
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginTop: 10,
                    }}
                  >
                    <label
                      style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}
                    >
                      {t('selectCdmFolder')}
                    </label>
                    <label style={{ display: 'inline-block' }}>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        // @ts-expect-error - webkitdirectory is not in React types
                        webkitdirectory="true"
                        directory="true"
                      />
                      <span
                        className="app-button"
                        style={{
                          background: '#fff',
                          color: '#1976d2',
                          border: '1px solid #1976d2',
                          fontWeight: 600,
                          fontSize: 15,
                          padding: '8px 22px',
                          borderRadius: 7,
                          cursor: 'pointer',
                          display: 'inline-block',
                        }}
                      >
                        {t('chooseFolder')}
                      </span>
                    </label>
                  </div>
                </div>
                {/* Fairplay */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e0e4ea',
                    borderRadius: 8,
                    padding: '1.2rem 1.5rem',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontWeight: 500,
                      fontSize: 16,
                      marginBottom: 10,
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: 18, height: 18 }}
                      disabled
                    />
                    {t('fairplay')}
                  </label>
                  <div
                    style={{
                      marginLeft: 28,
                      color: '#888',
                      fontSize: 15,
                      marginTop: 6,
                    }}
                  >
                    {t('comingSoon')}
                  </div>
                </div>
                {/* Playready */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e0e4ea',
                    borderRadius: 8,
                    padding: '1.2rem 1.5rem',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontWeight: 500,
                      fontSize: 16,
                      marginBottom: 10,
                    }}
                  >
                    <input type="checkbox" style={{ width: 18, height: 18 }} />
                    {t('playready')}
                  </label>
                  <div
                    style={{
                      marginLeft: 28,
                      marginTop: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <input
                      type="checkbox"
                      id="playready-cve"
                      style={{ width: 18, height: 18 }}
                    />
                    <label
                      htmlFor="playready-cve"
                      style={{
                        fontWeight: 500,
                        fontSize: 15,
                        cursor: 'pointer',
                      }}
                    >
                      {t('useLatestCve')}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 18,
              }}
            >
              <button
                className="app-button"
                style={{
                  background: '#fff',
                  color: '#1976d2',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '10px 32px',
                  borderRadius: 7,
                  border: '1px solid #1976d2',
                }}
              >
                {t('saveMediaDecryptionConfig')}
              </button>
            </div>
          </form>
        )}
        {downloadConfigSubTab === 'video-postprocessing' && (
          <form
            style={{
              maxWidth: 600,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>
              {t('videoPostprocessingOptions')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                {t('ensureContainerNormalization')}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                {t('convertTsToMp4')}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                {t('convertMkvToMp4')}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                {t('convertWebmToMp4')}
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                <input type="checkbox" style={{ width: 18, height: 18 }} />
                {t('compressWithX265')}
              </label>
            </div>
            <div style={{ marginTop: 18 }}>
              <label
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                {t('customFfmpegParams')}
              </label>
              <input
                type="text"
                className="app-button"
                style={{
                  width: '100%',
                  background: '#fff',
                  color: '#222',
                  fontSize: 15,
                  padding: '10px 14px',
                }}
                placeholder="e.g. -vf scale=1280:720 -b:v 1M -preset fast"
              />
              <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
                {t('ffmpegParamsHelp')}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 18,
              }}
            >
              <button
                className="app-button"
                style={{
                  background: '#fff',
                  color: '#1976d2',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '10px 32px',
                  borderRadius: 7,
                  border: '1px solid #1976d2',
                }}
              >
                {t('saveVideoPostprocessingConfig')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'system-log', label: t('systemLog'), content: <SystemLogTab /> },
    { id: 'auth-config', label: t('authConfig'), content: <AuthConfigTab /> },
    { id: 'cognitahz', label: t('cognitahz'), content: <CognitahzConfigTab /> },
    {
      id: 'download-config',
      label: t('downloadConfig'),
      content: <DownloadConfigTab />,
    },
  ];

  return (
    <div>
      <Header />
      <main className="main-content">
        <div
          className="content-wrapper"
          style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}
        >
          <h1 className="brand-title" style={{ marginBottom: 32 }}>
            {t('title')}
          </h1>
          <div
            className="section-card"
            style={{
              padding: '2.5rem 2rem',
              marginBottom: 40,
              width: '80vw',
              maxWidth: '1100px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {/* Tabs */}
            <div style={{ marginBottom: 32 }}>
              <div
                className="flex border-b border-gray-300"
                style={{ fontSize: '1.15rem', justifyContent: 'center' }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-6 font-semibold text-center border-b-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={{ fontSize: '1.1rem' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6" style={{ padding: '2rem 0 0 0' }}>
                {tabs.find((tab) => tab.id === activeTab)?.content}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
