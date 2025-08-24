import {
  SystemLog,
  TelegramAccount,
  RcloneCloud,
  DownloadedMaterial,
  Backup,
  Category,
  CourseNote,
  ZipPreset,
  DownloadConfigTab,
} from './types';

export const adminMockData = {
  systemLogs: [
    { time: '2025-08-17 10:01:23', message: 'System started.' },
    { time: '2025-08-17 10:02:10', message: 'User admin logged in.' },
    { time: '2025-08-17 10:05:44', message: 'Backup completed.' },
    { time: '2025-08-17 10:10:12', message: 'Telegram account linked.' },
    { time: '2025-08-17 10:12:01', message: 'Rclone cloud added.' },
  ] as SystemLog[],

  telegramAccounts: [
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
      groups: [{ id: 'g3', name: 'Work Group' }],
    },
  ] as TelegramAccount[],

  rcloneClouds: [
    {
      id: 'rc1',
      profile: 'main-gdrive',
      service: 'Google Drive',
      configValid: true,
      totalSize: '1 TB',
      backupSize: '250 GB',
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
  ] as RcloneCloud[],

  downloadedMaterials: [
    { id: 'mat1', name: 'Course: React Basics', size: '2.1 GB' },
    { id: 'mat2', name: 'Course: Advanced Python', size: '3.4 GB' },
    { id: 'mat3', name: 'Ebook: Clean Code', size: '12 MB' },
    { id: 'mat4', name: 'Video: AI Conference 2025', size: '1.2 GB' },
  ] as DownloadedMaterial[],

  backups: [
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
  ] as Backup[],

  categories: [
    { id: 1, name: 'General' },
    { id: 2, name: 'Programming' },
    { id: 3, name: 'Design' },
  ] as Category[],

  courseNotes: [
    { id: 'mat1', name: 'React Basics', notes: 5 },
    { id: 'mat2', name: 'Advanced Python', notes: 2 },
    { id: 'mat3', name: 'Clean Code', notes: 0 },
  ] as CourseNote[],

  zipPresets: [
    { value: '500mb', label: '500 MB' },
    { value: '1gb', label: '1 GB' },
    { value: '2gb', label: '2 GB' },
    { value: '4gb', label: '4 GB' },
  ] as ZipPreset[],

  downloadConfigTabs: [
    { id: 'file-system', label: 'File System' },
    { id: 'yt-dlp', label: 'yt-dlp Config' },
    { id: 'media-types', label: 'Media Types' },
    { id: 'media-decryption', label: 'Media Decryption' },
    { id: 'video-postprocessing', label: 'Video Post-processing' },
  ] as DownloadConfigTab[],
};
