'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/auth';
import Header from '@/components/Header';
import { useTranslations } from 'next-intl';

// Type definitions
interface DownloadedMaterial {
  id: string;
  name: string;
  size: string;
}

interface RcloneCloud {
  id: string;
  profile: string;
  service: string;
  configValid: boolean;
  totalSize?: string;
  backupSize?: string;
}

interface Backup {
  id: string;
  material: string;
  cloud: string;
  type: string;
  zip: string;
  zipSize: string;
  date: string;
  videoCompression?: string;
}

interface ZipPreset {
  value: string;
  label: string;
}

export default function BackupsPage() {
  const t = useTranslations('admin');
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  // --- Backup Management SubTabs State and API Data ---
  const [backupSubTab, setBackupSubTab] = useState<'create' | 'list'>('create');
  const [backups, setBackups] = useState<Backup[]>([]);
  const [downloadedMaterials, setDownloadedMaterials] = useState<
    DownloadedMaterial[]
  >([]);
  const [selectedMaterial, setSelectedMaterial] = useState('mat1');
  const [selectedCloud, setSelectedCloud] = useState('rc1');
  const [backupType, setBackupType] = useState('mirror');
  const [keepFilesOnDisk, setKeepFilesOnDisk] = useState(false);
  const [keepFilesPath, setKeepFilesPath] = useState('');
  const [zipType, setZipType] = useState('none');
  const [zipPreset, setZipPreset] = useState('1gb');
  const [videoCompression, setVideoCompression] = useState('x265');
  const [rcloneClouds, setRcloneClouds] = useState<RcloneCloud[]>([]);
  const [zipPresets, setZipPresets] = useState<ZipPreset[]>([]);

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

    const loadBackupsData = async () => {
      try {
        // Load all backup data from mock API
        const [backupsRes, materialsRes, cloudsRes, zipPresetsRes] =
          await Promise.all([
            fetch('/api/admin/backups'),
            fetch('/api/admin/downloaded-materials'),
            fetch('/api/admin/rclone-clouds'),
            fetch('/api/admin/zip-presets'),
          ]);

        const [backupsData, materialsData, cloudsData, zipPresetsData] =
          await Promise.all([
            backupsRes.json(),
            materialsRes.json(),
            cloudsRes.json(),
            zipPresetsRes.json(),
          ]);

        setBackups(backupsData.backups || []);
        setDownloadedMaterials(materialsData.materials || []);
        setRcloneClouds(cloudsData.clouds || []);
        setZipPresets(zipPresetsData.presets || []);

        // Set initial selections based on loaded data
        if (materialsData.materials?.length > 0) {
          setSelectedMaterial(materialsData.materials[0].id);
        }
        if (cloudsData.clouds?.length > 0) {
          setSelectedCloud(cloudsData.clouds[0].id);
        }
      } catch (error) {
        console.error('Failed to load backups data:', error);
      }
    };

    checkAuth();
    loadBackupsData();
  }, [isLoggedIn, logout, router]);

  // API functions for backup operations
  const handleCreateBackup = async () => {
    try {
      const selectedMaterialName =
        downloadedMaterials.find((m) => m.id === selectedMaterial)?.name || '';
      const selectedCloudName =
        rcloneClouds.find((c) => c.id === selectedCloud)?.profile +
          ' (' +
          rcloneClouds.find((c) => c.id === selectedCloud)?.service +
          ')' || '';

      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material: selectedMaterialName,
          cloud: selectedCloudName,
          type: backupType,
          zipType: zipType,
          zipSize:
            zipType === 'separate' || zipType === 'dependent'
              ? zipPresets.find((p) => p.value === zipPreset)?.label || '-'
              : '-',
          videoCompression: videoCompression,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBackups((prev) => [...prev, data.backup]);
        // Switch to list tab to show the new backup
        setBackupSubTab('list');
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  const handleTestBackup = async () => {
    try {
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupConfig: {
            material: selectedMaterial,
            cloud: selectedCloud,
            type: backupType,
            zipType: zipType,
            videoCompression: videoCompression,
          },
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message || 'Backup test completed successfully');
      }
    } catch (error) {
      console.error('Failed to test backup:', error);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId }),
      });
      const data = await response.json();
      if (data.success) {
        setBackups((prev) => prev.filter((b) => b.id !== backupId));
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
    }
  };

  const BackupCreateTab = () => (
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
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <label>
              <input
                type="radio"
                name="backupType"
                value="mirror"
                checked={backupType === 'mirror'}
                onChange={() => setBackupType('mirror')}
              />{' '}
              {t('mirror')}
            </label>
            <label>
              <input
                type="radio"
                name="backupType"
                value="move"
                checked={backupType === 'move'}
                onChange={() => setBackupType('move')}
              />{' '}
              {t('move')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                checked={keepFilesOnDisk}
                onChange={(e) => setKeepFilesOnDisk(e.target.checked)}
              />
              <span>{t('keepFilesOnDisk')}</span>
              {keepFilesOnDisk && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginLeft: 10,
                  }}
                >
                  <input
                    type="text"
                    className="app-button"
                    style={{ width: 200 }}
                    placeholder={t('selectPath')}
                    value={keepFilesPath}
                    onChange={(e) => setKeepFilesPath(e.target.value)}
                  />
                  <button
                    className="app-button"
                    type="button"
                    style={{ padding: '6px 12px' }}
                  >
                    {t('browse')}
                  </button>
                </div>
              )}
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
              <span>{t('noZip')}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="radio"
                name="zipType"
                value="single"
                checked={zipType === 'single'}
                onChange={() => setZipType('single')}
              />
              <span>{t('singleZip')}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="radio"
                name="zipType"
                value="separate"
                checked={zipType === 'separate'}
                onChange={() => setZipType('separate')}
              />
              <span>{t('separateZip')}</span>
              {zipType === 'separate' && (
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
            <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="radio"
                name="zipType"
                value="dependent"
                checked={zipType === 'dependent'}
                onChange={() => setZipType('dependent')}
              />
              <span>{t('dependentZip')}</span>
              {zipType === 'dependent' && (
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
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500 }}>{t('videoCompression')}</label>
          <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
            <label>
              <input
                type="checkbox"
                checked={videoCompression === 'x265'}
                onChange={(e) =>
                  setVideoCompression(e.target.checked ? 'x265' : 'none')
                }
              />{' '}
              {t('compressToX265')}
            </label>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
        <button
          className="app-button"
          style={{ background: '#2196f3', color: 'white' }}
          onClick={handleCreateBackup}
        >
          {t('startBackup')}
        </button>
        <button
          className="app-button"
          style={{ background: '#4caf50', color: 'white' }}
          onClick={handleTestBackup}
        >
          {t('testBackup')}
        </button>
      </div>
    </form>
  );

  const BackupListTab = () => (
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
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 8,
              }}
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
                onClick={() => handleDeleteBackup(b.id)}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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

  return (
    <div>
      <Header />
      <main className="main-content">
        <div
          className="content-wrapper"
          style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}
        >
          <h1 className="brand-title" style={{ marginBottom: 32 }}>
            {t('backup')}
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
            <div style={{ marginBottom: 32 }}>
              <div
                className="flex border-b border-gray-300"
                style={{ fontSize: '1.15rem' }}
              >
                <button
                  onClick={() => setBackupSubTab('create')}
                  className={`py-3 px-6 font-semibold text-center border-b-2 transition-colors duration-200 ${backupSubTab === 'create' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  style={{ fontSize: '1.1rem', minWidth: 180 }}
                >
                  {t('createBackup')}
                </button>
                <button
                  onClick={() => setBackupSubTab('list')}
                  className={`py-3 px-6 font-semibold text-center border-b-2 transition-colors duration-200 ${backupSubTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  style={{ fontSize: '1.1rem', minWidth: 180 }}
                >
                  {t('existingBackups')}
                </button>
              </div>
              <div className="p-6" style={{ padding: '2rem 0 0 0' }}>
                {backupSubTab === 'create' && <BackupCreateTab />}
                {backupSubTab === 'list' && <BackupListTab />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
