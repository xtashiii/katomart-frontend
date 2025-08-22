export interface ScrapperPlatform {
  id: string;
  name: string;
  needsLoginUrl?: boolean;
  needsBaseUrl?: boolean;
  loginUrlLabel?: string;
  baseUrlLabel?: string;
}

export interface DownloadConfig {
  filePattern: string;
  maxConcurrent: number;
  allowedTypes: string;
  ffmpegArgs: string;
  downloadPath: string;
  createSubfolders: boolean;
}

export interface ScrapperLesson {
  id: string;
  name: string;
}

export interface ScrapperModule {
  id: string;
  name: string;
  lessons: ScrapperLesson[];
}

export interface ScrapperCourse {
  id: string;
  name: string;
  modules: ScrapperModule[];
}
