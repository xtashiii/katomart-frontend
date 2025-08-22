export interface SystemLog {
  time: string;
  message: string;
}

export interface TelegramGroup {
  id: string;
  name: string;
}

export interface TelegramAccount {
  id: string;
  username: string;
  groups: TelegramGroup[];
}

export interface RcloneCloud {
  id: string;
  profile: string;
  service: string;
  configValid: boolean;
  totalSize: string;
  backupSize: string;
}

export interface DownloadedMaterial {
  id: string;
  name: string;
  size: string;
}

export interface Backup {
  id: string;
  material: string;
  cloud: string;
  type: string;
  zip: string;
  zipSize: string;
  date: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CourseNote {
  id: string;
  name: string;
  notes: number;
}

export interface ZipPreset {
  value: string;
  label: string;
}

export interface DownloadConfigTab {
  id: string;
  label: string;
}
