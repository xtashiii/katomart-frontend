export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  thumbnail?: string;
  progress: number;
  totalLessons: number;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastAccessed?: string;
  fileSize?: number;
  downloadStatus?: 'complete' | 'partial' | 'missing';
  lastUpdated?: string;
  language?: string;
  progressStatus?: 'not-started' | 'in-progress' | 'completed' | 'bookmarked';
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  order: number;
  hasVideo: boolean;
  videoUrl?: string;
  duration?: number;
  completed: boolean;
  hasAttachments: boolean;
  attachments: Attachment[];
  notes: string;
  userRating?: number;
}

export interface Module {
  id: string;
  name: string;
  order: number;
  userRating: number;
  lessons: Lesson[];
  completed: boolean;
  progress: number;
}

export interface DetailedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  thumbnail?: string;
  instructor: string;
  totalDuration: number;
  enrollmentDate: string;
  lastAccessed: string;
  overallProgress: number;
  modules: Module[];
}

export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  platform?: string;
  durationRange?: string;
}

export interface ImportCourseData {
  title: string;
  description?: string;
  category?: string;
  platform?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedLessons?: number;
  estimatedDuration?: number;
  instructor?: string;
  language?: string;
  sourceUrl?: string;
  requiresAuth?: boolean;
}

export interface TelegramImportData {
  channelId: string;
  authMethod: 'bot' | 'telethon';
  botToken?: string;
  contentFormat: 'stream' | 'zip';
  messageRange?: {
    start?: number;
    end?: number;
  };
  filterKeywords?: string[];
}
