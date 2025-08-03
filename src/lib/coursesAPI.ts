// Mock API service for courses
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
  durationRange?: string; // e.g., "0-20", "20-40", "40+"
}

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete React Development Course',
    description: 'Learn React from basics to advanced concepts including hooks, context, and performance optimization.',
    category: 'programming',
    platform: 'Udemy',
    thumbnail: '/api/placeholder/300/200',
    progress: 75,
    totalLessons: 45,
    duration: 25,
    difficulty: 'intermediate',
    lastAccessed: '2025-08-01'
  },
  {
    id: '2',
    title: 'UI/UX Design Fundamentals',
    description: 'Master the principles of user interface and user experience design.',
    category: 'design',
    platform: 'Coursera',
    progress: 30,
    totalLessons: 32,
    duration: 18,
    difficulty: 'beginner',
    lastAccessed: '2025-07-28'
  },
  {
    id: '3',
    title: 'Business Strategy and Planning',
    description: 'Learn how to create effective business strategies and implementation plans.',
    category: 'business',
    platform: 'LinkedIn Learning',
    progress: 85,
    totalLessons: 28,
    duration: 15,
    difficulty: 'advanced',
    lastAccessed: '2025-08-02'
  },
  {
    id: '4',
    title: 'Spanish Language for Beginners',
    description: 'Start your journey learning Spanish with basic vocabulary and grammar.',
    category: 'language',
    platform: 'Duolingo',
    progress: 45,
    totalLessons: 60,
    duration: 40,
    difficulty: 'beginner',
    lastAccessed: '2025-07-30'
  },
  {
    id: '5',
    title: 'Data Science with Python',
    description: 'Explore data analysis, machine learning, and statistical modeling using Python.',
    category: 'science',
    platform: 'edX',
    progress: 60,
    totalLessons: 55,
    duration: 35,
    difficulty: 'advanced',
    lastAccessed: '2025-08-01'
  },
  {
    id: '6',
    title: 'Calculus and Linear Algebra',
    description: 'Mathematical foundations for engineering and computer science.',
    category: 'math',
    platform: 'Khan Academy',
    progress: 20,
    totalLessons: 42,
    duration: 30,
    difficulty: 'advanced',
    lastAccessed: '2025-07-25'
  },
  {
    id: '7',
    title: 'World War II History',
    description: 'Comprehensive study of the causes, events, and consequences of WWII.',
    category: 'history',
    platform: 'MasterClass',
    progress: 90,
    totalLessons: 25,
    duration: 20,
    difficulty: 'intermediate',
    lastAccessed: '2025-08-03'
  },
  {
    id: '8',
    title: 'Digital Art and Illustration',
    description: 'Create stunning digital artwork using modern tools and techniques.',
    category: 'art',
    platform: 'Skillshare',
    progress: 55,
    totalLessons: 38,
    duration: 22,
    difficulty: 'intermediate',
    lastAccessed: '2025-07-29'
  },
  {
    id: '9',
    title: 'Advanced JavaScript Concepts',
    description: 'Deep dive into JavaScript including closures, prototypes, and async programming.',
    category: 'programming',
    platform: 'Pluralsight',
    progress: 40,
    totalLessons: 50,
    duration: 28,
    difficulty: 'advanced',
    lastAccessed: '2025-07-31'
  },
  {
    id: '10',
    title: 'Mobile App Design Patterns',
    description: 'Learn design patterns and best practices for mobile applications.',
    category: 'design',
    platform: 'Udemy',
    progress: 15,
    totalLessons: 35,
    duration: 16,
    difficulty: 'intermediate',
    lastAccessed: '2025-07-26'
  },
  {
    id: '11',
    title: 'Financial Management',
    description: 'Master personal and business financial planning and management.',
    category: 'business',
    platform: 'Coursera',
    progress: 70,
    totalLessons: 30,
    duration: 18,
    difficulty: 'intermediate',
    lastAccessed: '2025-08-02'
  },
  {
    id: '12',
    title: 'French Conversation Practice',
    description: 'Improve your French speaking skills through guided conversation practice.',
    category: 'language',
    platform: 'Babbel',
    progress: 25,
    totalLessons: 48,
    duration: 24,
    difficulty: 'intermediate',
    lastAccessed: '2025-07-27'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CoursesAPI {
  static async getCourses(params: CoursesParams = {}): Promise<CoursesResponse> {
    await delay(800); // Simulate network delay

    const {
      page = 1,
      limit = 6,
      search = '',
      category = 'all',
      platform = 'all',
      durationRange = 'all'
    } = params;

    // Filter courses
    let filteredCourses = mockCourses;

    // Apply category filter
    if (category && category !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }

    // Apply platform filter
    if (platform && platform !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.platform === platform);
    }

    // Apply duration range filter
    if (durationRange && durationRange !== 'all') {
      filteredCourses = filteredCourses.filter(course => {
        const duration = course.duration;
        switch (durationRange) {
          case '0-20':
            return duration <= 20;
          case '20-40':
            return duration > 20 && duration <= 40;
          case '40+':
            return duration > 40;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower) ||
        course.platform.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = filteredCourses.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const courses = filteredCourses.slice(startIndex, endIndex);

    return {
      courses,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  static async getCourse(id: string): Promise<Course | null> {
    await delay(500);
    return mockCourses.find(course => course.id === id) || null;
  }

  static async getFilterOptions(): Promise<{
    categories: string[];
    platforms: string[];
  }> {
    await delay(200);
    
    const categories = [...new Set(mockCourses.map(course => course.category))].sort();
    const platforms = [...new Set(mockCourses.map(course => course.platform))].sort();
    
    return {
      categories,
      platforms
    };
  }
}
