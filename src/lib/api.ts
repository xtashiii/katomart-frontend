import { DetailedCourse, CoursesResponse, CoursesParams, ImportCourseData, TelegramImportData } from '@/app/api/courses/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CoursesAPI {
  static async getCourses(params: CoursesParams = {}): Promise<CoursesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.category) searchParams.set('category', params.category);
    if (params.platform) searchParams.set('platform', params.platform);
    if (params.durationRange) searchParams.set('durationRange', params.durationRange);

    const response = await fetch(`/api/courses?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    
    return response.json();
  }

  static async getDetailedCourse(id: string): Promise<DetailedCourse | null> {
    const response = await fetch(`/api/courses/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch course details');
    }
    
    return response.json();
  }

  static async getFilterOptions() {
    await delay(300);
    return {
      categories: [
        { value: 'all', label: 'All Categories' },
        { value: 'programming', label: 'Programming' },
        { value: 'design', label: 'Design' },
        { value: 'business', label: 'Business' },
        { value: 'language', label: 'Language' },
        { value: 'science', label: 'Science' },
        { value: 'math', label: 'Math' },
        { value: 'history', label: 'History' },
        { value: 'art', label: 'Art' }
      ],
      platforms: [
        { value: 'all', label: 'All Platforms' },
        { value: 'Udemy', label: 'Udemy' },
        { value: 'Coursera', label: 'Coursera' },
        { value: 'LinkedIn Learning', label: 'LinkedIn Learning' },
        { value: 'edX', label: 'edX' },
        { value: 'Pluralsight', label: 'Pluralsight' },
        { value: 'Skillshare', label: 'Skillshare' },
        { value: 'MasterClass', label: 'MasterClass' },
        { value: 'Khan Academy', label: 'Khan Academy' },
        { value: 'Duolingo', label: 'Duolingo' },
        { value: 'Babbel', label: 'Babbel' }
      ],
      durations: [
        { value: 'all', label: 'All Durations' },
        { value: '0-20', label: '0-20 hours' },
        { value: '20-40', label: '20-40 hours' },
        { value: '40+', label: '40+ hours' }
      ],
      languages: [
        { value: 'all', label: 'All Languages' },
        { value: 'English', label: 'English' },
        { value: 'Spanish', label: 'Spanish' },
        { value: 'French', label: 'French' },
        { value: 'German', label: 'German' },
        { value: 'Portuguese', label: 'Portuguese' }
      ]
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async uploadCourseFiles(_formData: ImportCourseData, _files: File[]) {
    await delay(2000);
    return {
      success: true,
      message: 'Course files uploaded successfully',
      courseId: 'uploaded-' + Date.now()
    };
  }

  static async importCourseFromUrl(formData: ImportCourseData) {
    const response = await fetch('/api/courses/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'course', data: formData })
    });
    
    if (!response.ok) {
      throw new Error('Failed to import course');
    }
    
    return response.json();
  }

  static async importFromTelegram(formData: ImportCourseData, telegramData: TelegramImportData) {
    const response = await fetch('/api/courses/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'telegram', data: telegramData })
    });
    
    if (!response.ok) {
      throw new Error('Failed to import from Telegram');
    }
    
    return response.json();
  }

  static async importFromFolder(_formData: ImportCourseData, folderPath: string, createWeakLink: boolean) {
    await delay(1500);
    return {
      success: true,
      message: 'Course imported from folder successfully',
      courseId: 'folder-' + Date.now(),
      folderPath,
      createWeakLink
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async updateLessonNotes(_courseId: string, _lessonId: string, _notes: string) {
    await delay(500);
    return { success: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async markLessonCompleted(_courseId: string, _lessonId: string) {
    await delay(300);
    return { success: true };
  }
}
