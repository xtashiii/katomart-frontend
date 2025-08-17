'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/auth';
import Header from '@/components/Header';





export default function AdminPage() {
  // --- Backup Management SubTabs State and Mock Data ---
  const [backupSubTab, setBackupSubTab] = useState<'create' | 'list'>('create');
  // Mock backups data
  const [backups] = useState([
    {
      id: 'b1',
      material: 'Course: React Basics',
      cloud: 'main-gdrive (Google Drive)',
      type: 'mirror',
      zip: 'none',
      zipSize: '-',
      date: '2025-08-16 14:22',
    },
    {
      id: 'b2',
      material: 'Ebook: Clean Code',
      cloud: 'archive-onedrive (OneDrive)',
      type: 'move',
      zip: 'zip',
      zipSize: '1 GB',
      date: '2025-08-15 09:10',
    },
  ]);
  const t = useTranslations('admin');
  // --- All hooks at the top, before any conditional return ---
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('system-log');
  const [authSubTab, setAuthSubTab] = useState('telegram');
  const [logs] = useState([
    { time: '2025-08-17 10:01:23', message: 'System started.' },
    { time: '2025-08-17 10:02:10', message: 'User admin logged in.' },
    { time: '2025-08-17 10:05:44', message: 'Backup completed.' },
    { time: '2025-08-17 10:10:12', message: 'Telegram account linked.' },
    { time: '2025-08-17 10:12:01', message: 'Rclone cloud added.' },
  ]);
  const [telegramAccounts] = useState([
    {
      id: 'tg1',
      username: 'my_personal_account',
      groups: [
        { id: 'g1', name: 'Admin Group 1' },
        { id: 'g2', name: 'Project Channel' },
      ],
    },
    {
      id: 'tg2',
      username: 'work_account',
      groups: [
        { id: 'g3', name: 'Work Group' },
      ],
    },
  ]);

  const [rcloneClouds] = useState([
    {
      id: 'rc1',
      profile: 'main-gdrive',
      service: 'Google Drive',
      configValid: true,
    },
    {
      id: 'rc2',
      profile: 'work-dropbox',
      service: 'Dropbox',
      configValid: false,
      totalSize: '2 TB',
      backupSize: '0 GB',
    },
    {
      id: 'rc3',
      profile: 'archive-onedrive',
      service: 'OneDrive',
      configValid: true,
      totalSize: '500 GB',
      backupSize: '120 GB',
    },
  ]);

  // --- Backup Management Tab state ---
  const [downloadedMaterials] = useState([
    { id: 'mat1', name: 'Course: React Basics', size: '2.1 GB' },
    { id: 'mat2', name: 'Course: Advanced Python', size: '3.4 GB' },
    { id: 'mat3', name: 'Ebook: Clean Code', size: '12 MB' },
    { id: 'mat4', name: 'Video: AI Conference 2025', size: '1.2 GB' },
  ]);
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

    // --- Backup Create Tab (i18n) ---
    const BackupCreateTab = () => (
      <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={e => e.preventDefault()}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>{t('materialToBackup')}</label>
            <select className="app-button" style={{ width: '100%', marginTop: 8 }} value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)}>
              {downloadedMaterials.map(mat => (
                <option key={mat.id} value={mat.id}>{mat.name} ({mat.size})</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>{t('destinationCloud')}</label>
            <select className="app-button" style={{ width: '100%', marginTop: 8 }} value={selectedCloud} onChange={e => setSelectedCloud(e.target.value)}>
              {rcloneClouds.map(cloud => (
                <option key={cloud.id} value={cloud.id}>{cloud.profile} ({cloud.service})</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>{t('backupType')}</label>
            <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
              <label><input type="radio" name="backupType" value="mirror" checked={backupType === 'mirror'} onChange={() => setBackupType('mirror')} /> {t('mirror', { default: 'Mirror (copy only)' })}</label>
              <label><input type="radio" name="backupType" value="move" checked={backupType === 'move'} onChange={() => setBackupType('move')} /> {t('move', { default: 'Move (copy & free disk)' })}</label>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>{t('zipType')}</label>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="radio" name="zipType" value="none" checked={zipType === 'none'} onChange={() => setZipType('none')} />
                <span>{t('noZip', { default: 'No Zip' })}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="radio" name="zipType" value="single" checked={zipType === 'single'} onChange={() => setZipType('single')} />
                <span>{t('singleZip', { default: 'Single Zip' })}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="radio" name="zipType" value="split" checked={zipType === 'split'} onChange={() => setZipType('split')} />
                <span>{t('splitZip', { default: 'Split Zip' })}</span>
                {zipType === 'split' && (
                  <select className="app-button" style={{ marginLeft: 8, width: 120 }} value={zipPreset} onChange={e => setZipPreset(e.target.value)}>
                    <option value="500mb">500 MB</option>
                    <option value="1gb">1 GB</option>
                    <option value="2gb">2 GB</option>
                    <option value="4gb">4 GB</option>
                  </select>
                )}
              </label>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
          <button className="app-button" style={{ background: '#2196f3', color: 'white' }}>{t('startBackup', { default: 'Start Backup' })}</button>
          <button className="app-button" style={{ background: '#4caf50', color: 'white' }}>{t('testBackup', { default: 'Test Backup' })}</button>
        </div>
      </form>
    );
  if (isLoading) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div className="content-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
            <div>{t('loading')}</div>
          </div>
        </main>
      </div>
    );
  }

  // --- System Log Tab ---
  const SystemLogTab = () => (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 className="section-title" style={{ marginBottom: 16 }}>{t('systemLog')}</h2>
      <div style={{
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
      }}>
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
      <h3 className="section-title" style={{ marginBottom: 16 }}>{t('telegram')}</h3>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, justifyContent: 'center' }}>
        <button className="app-button">{t('addPersonalAccount')}</button>
        <button className="app-button" style={{ background: '#dc3545', color: 'white' }}>{t('removePersonalAccount')}</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>{t('linkedAccounts')}</b>
        {telegramAccounts.length === 0 && <div style={{ color: '#888', marginTop: 8 }}>{t('noAccounts')}</div>}
        {telegramAccounts.map(acc => (
          <div key={acc.id} style={{
            background: 'var(--background)',
            borderRadius: 10,
            margin: '16px 0',
            padding: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>@{acc.username}</div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>{t('groupsChannels')}</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {acc.groups.map(g => (
                <li key={g.id} style={{ fontSize: 15, marginBottom: 4 }}>{g.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Rclone Clouds SubTab ---
  const RcloneCloudsTab = () => (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: 16 }}>{t('rclone')}</h3>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <button className="app-button">{t('addRcloneCloud')}</button>
      </div>
      <div>
        <b>{t('cloudProfiles')}</b>
        {rcloneClouds.length === 0 && <div style={{ color: '#888', marginTop: 8 }}>{t('noProfiles')}</div>}
        {rcloneClouds.length > 0 && (
          <div style={{ marginTop: 16, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
              <thead>
                <tr style={{ background: 'var(--background)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600 }}>{t('profile')}</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600 }}>{t('service')}</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 600 }}>{t('config')}</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600 }}>{t('cloudSize')}</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600 }}>{t('backupsSize')}</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 600 }}>{t('test')}</th>
                </tr>
              </thead>
              <tbody>
                {rcloneClouds.map(cloud => (
                  <tr key={cloud.id} style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 500 }}>{cloud.profile}</td>
                    <td style={{ padding: '10px 8px' }}>{cloud.service}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 8,
                        background: cloud.configValid ? '#e8f5e9' : '#ffebee',
                        color: cloud.configValid ? '#388e3c' : '#c62828',
                        fontWeight: 600,
                        fontSize: 15,
                      }}>
                        {cloud.configValid ? t('valid') : t('invalid')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{cloud.totalSize}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{cloud.backupSize}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <button className="app-button" style={{ padding: '4px 14px', fontSize: 15 }}>{t('test')}</button>
                    </td>
                  </tr>
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
      <div className="flex border-b border-gray-200 mb-4" style={{ gap: 0 }}>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 ${authSubTab === 'telegram' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setAuthSubTab('telegram')}
        >{t('telegram')}</button>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 ${authSubTab === 'rclone' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setAuthSubTab('rclone')}
        >{t('rclone')}</button>
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



  const BackupListTab = () => (
    <div style={{ marginTop: 16, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
      {backups.length === 0 && <div style={{ color: '#888', textAlign: 'center' }}>No backups found.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {backups.map(b => (
          <div key={b.id} style={{
            background: 'var(--surface)',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid var(--border)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ flex: 2, minWidth: 180 }}><b>Material:</b> {b.material}</div>
              <div style={{ flex: 2, minWidth: 180 }}><b>Cloud:</b> {b.cloud}</div>
              <div style={{ flex: 1, minWidth: 120 }}><b>Type:</b> {b.type}</div>
              <div style={{ flex: 1, minWidth: 120 }}><b>ZIP:</b> {b.zip}</div>
              <div style={{ flex: 1, minWidth: 120 }}><b>Split Size:</b> {b.zipSize}</div>
              <div style={{ flex: 1, minWidth: 120 }}><b>Date:</b> {b.date}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="app-button" style={{ background: '#2196f3', color: 'white' }}>Retrieve (Mirror)</button>
                <button className="app-button" style={{ background: '#2196f3', color: 'white' }}>Retrieve (Move)</button>
              </div>
              <button className="app-button" style={{ background: '#4caf50', color: 'white' }}>Test</button>
              <button className="app-button" style={{ background: '#f44336', color: 'white' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BackupTab = () => (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: 24 }}>Backup Management</h3>
      <div className="flex border-b border-gray-200 mb-4" style={{ gap: 0 }}>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 ${backupSubTab === 'create' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setBackupSubTab('create')}
        >Create Backup</button>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 ${backupSubTab === 'list' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setBackupSubTab('list')}
        >Existing Backups</button>
      </div>
      <div>
        {backupSubTab === 'create' && <BackupCreateTab />}
        {backupSubTab === 'list' && <BackupListTab />}
      </div>
    </div>
  );



  const CognitahzConfigTab = () => (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: 24 }}>{t('cognitahz')}</h3>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={e => e.preventDefault()}>
        <div>
          <label style={{ fontWeight: 500 }}>{t('mediaServerUrl')}</label>
          <input
            type="text"
            className="app-button"
            style={{ width: '100%', marginTop: 8, color: '#222', background: '#fff' }}
            value={mediaServer}
            onChange={e => setMediaServer(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>{t('authType')}</label>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" name="authType" value="userpass" checked={authType === 'userpass'} onChange={() => setAuthType('userpass')} />
              {t('username')}/{t('password')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" name="authType" value="jwt" checked={authType === 'jwt'} onChange={() => setAuthType('jwt')} />
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
                style={{ width: '100%', marginTop: 8, color: '#222', background: '#fff' }}
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>{t('password')}</label>
              <input
                type="password"
                className="app-button"
                style={{ width: '100%', marginTop: 8, color: '#222', background: '#fff' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              style={{ width: '100%', marginTop: 8, color: '#222', background: '#fff' }}
              value={jwt}
              onChange={e => setJwt(e.target.value)}
            />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button className="app-button" style={{ background: '#4caf50', color: 'white', minWidth: 180 }}>{t('testConnection')}</button>
        </div>
      </form>
    </div>
  );


  // --- Download Config Tab ---
  const DownloadConfigTab = () => (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 className="section-title" style={{ marginBottom: 24 }}>{t('downloadConfig')}</h3>
      <div style={{ color: '#666', fontSize: 16, textAlign: 'center', marginTop: 32 }}>
        {t('downloadConfigPlaceholder')}
      </div>
    </div>
  );

  const tabs = [
    { id: 'system-log', label: t('systemLog'), content: <SystemLogTab /> },
    { id: 'auth-config', label: t('authConfig'), content: <AuthConfigTab /> },
    { id: 'backup', label: t('backup'), content: <BackupTab /> },
    { id: 'cognitahz', label: t('cognitahz'), content: <CognitahzConfigTab /> },
    { id: 'download-config', label: t('downloadConfig'), content: <DownloadConfigTab /> },
  ];

  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="content-wrapper" style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
          <h1 className="brand-title" style={{ marginBottom: 32 }}>{t('title')}</h1>
          <div className="section-card" style={{ padding: '2.5rem 2rem', marginBottom: 40, width: '80vw', maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto' }}>
            {/* Tabs */}
            <div style={{ marginBottom: 32 }}>
              <div className="flex border-b border-gray-300" style={{ fontSize: '1.15rem' }}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-6 font-semibold text-center border-b-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={{ fontSize: '1.1rem', minWidth: 180 }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6" style={{ padding: '2rem 0 0 0' }}>
                {tabs.find(tab => tab.id === activeTab)?.content}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
