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
  fileSize?: number; // Size in MB - optional for now
  downloadStatus?: 'complete' | 'partial' | 'missing'; // optional for now
  lastUpdated?: string; // ISO date string - optional for now
  language?: string; // optional for now
  progressStatus?: 'not-started' | 'in-progress' | 'completed' | 'bookmarked'; // optional for now
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
  userRating?: number; // 0-5 rating from user
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
  durationRange?: string; // e.g., "0-20", "20-40", "40+"
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
  sourceUrl?: string; // For URL imports
  requiresAuth?: boolean; // For cloud storage that requires authentication
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
    lastAccessed: '2025-08-01',
    fileSize: 1250, // 1.25GB
    downloadStatus: 'complete',
    lastUpdated: '2025-07-28',
    language: 'English',
    progressStatus: 'in-progress'
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
    lastAccessed: '2025-07-28',
    fileSize: 450, // 450MB
    downloadStatus: 'complete',
    lastUpdated: '2025-07-20',
    language: 'English',
    progressStatus: 'in-progress'
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

// Mock detailed course data
const mockDetailedCourses: { [key: string]: DetailedCourse } = {
  '1': {
    id: '1',
    title: 'Complete React Development Course',
    description: 'Learn React from basics to advanced concepts including hooks, context, and performance optimization.',
    category: 'programming',
    platform: 'Udemy',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'John Doe',
    totalDuration: 25,
    enrollmentDate: '2025-07-01',
    lastAccessed: '2025-08-01',
    overallProgress: 75,
    modules: [
      {
        id: 'mod1',
        name: 'React Fundamentals',
        order: 1,
        userRating: 5,
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'lesson1',
            name: 'Introduction to React',
            description: 'Understanding what React is and why it\'s useful for building user interfaces.',
            order: 1,
            hasVideo: true,
            videoUrl: '/test_media/wait_for_me.mp4',
            duration: 15,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'att1',
                name: 'React Basics Slides.pdf',
                type: 'pdf',
                size: 2048000,
                url: '/api/attachments/react-basics.pdf'
              },
              {
                id: 'att2',
                name: 'Starter Code.zip',
                type: 'zip',
                size: 1024000,
                url: '/api/attachments/starter-code.zip'
              }
            ],
            notes: 'React is a JavaScript library for building user interfaces. Key concepts:\n- Components\n- JSX\n- Virtual DOM\n- Unidirectional data flow',
            userRating: 5
          },
          {
            id: 'lesson2',
            name: 'JSX and Components',
            description: 'Learning JSX syntax and creating your first React components.',
            order: 2,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            duration: 20,
            completed: true,
            hasAttachments: false,
            attachments: [],
            notes: 'JSX allows us to write HTML-like syntax in JavaScript:\n- JSX elements\n- Props\n- Component composition',
            userRating: 4
          }
        ]
      },
      {
        id: 'mod2',
        name: 'State and Props',
        order: 2,
        userRating: 4,
        completed: false,
        progress: 60,
        lessons: [
          {
            id: 'lesson3',
            name: 'Understanding Props',
            description: 'How to pass data between components using props.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: 18,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'att3',
                name: 'Props Examples.pdf',
                type: 'pdf',
                size: 1536000,
                url: '/api/attachments/props-examples.pdf'
              }
            ],
            notes: 'Props are read-only data passed from parent to child components.',
            userRating: 5
          },
          {
            id: 'lesson4',
            name: 'State Management',
            description: 'Managing component state with useState hook.',
            order: 2,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            duration: 25,
            completed: false,
            hasAttachments: false,
            attachments: [],
            notes: 'State allows components to manage and update their own data over time.',
            userRating: 0
          }
        ]
      },
      {
        id: 'mod3',
        name: 'Advanced Concepts',
        order: 3,
        userRating: 0,
        completed: false,
        progress: 0,
        lessons: [
          {
            id: 'lesson5',
            name: 'Context API',
            description: 'Managing global state with React Context.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            duration: 30,
            completed: false,
            hasAttachments: true,
            attachments: [
              {
                id: 'att4',
                name: 'Context Examples.zip',
                type: 'zip',
                size: 2048000,
                url: '/api/attachments/context-examples.zip'
              }
            ],
            notes: ''
          }
        ]
      }
    ]
  },
  '2': {
    id: '2',
    title: 'UI/UX Design Fundamentals',
    description: 'Master the principles of user interface and user experience design.',
    category: 'design',
    platform: 'Coursera',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Jane Smith',
    totalDuration: 18,
    enrollmentDate: '2025-07-15',
    lastAccessed: '2025-07-28',
    overallProgress: 30,
    modules: [
      {
        id: 'design-mod1',
        name: 'Design Principles',
        order: 1,
        userRating: 5,
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'design-lesson1',
            name: 'Color Theory',
            description: 'Understanding color psychology and application in design.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: 22,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'design-att1',
                name: 'Color Palette Guide.pdf',
                type: 'pdf',
                size: 3072000,
                url: '/api/attachments/color-guide.pdf'
              }
            ],
            notes: 'Color theory basics:\n- Primary, secondary, tertiary colors\n- Color harmony\n- Psychological effects of colors'
          },
          {
            id: 'design-lesson2',
            name: 'Typography Fundamentals',
            description: 'Choosing and pairing fonts for effective design communication.',
            order: 2,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            duration: 18,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'design-att2',
                name: 'Font Pairing Examples.pdf',
                type: 'pdf',
                size: 2560000,
                url: '/api/attachments/font-pairing.pdf'
              }
            ],
            notes: 'Typography principles:\n- Font families and weights\n- Hierarchy and readability\n- Pairing complementary fonts'
          }
        ]
      },
      {
        id: 'design-mod2',
        name: 'User Experience Design',
        order: 2,
        userRating: 0,
        completed: false,
        progress: 0,
        lessons: [
          {
            id: 'design-lesson3',
            name: 'User Research Methods',
            description: 'Techniques for understanding user needs and behaviors.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: 25,
            completed: false,
            hasAttachments: true,
            attachments: [
              {
                id: 'design-att3',
                name: 'Research Template.docx',
                type: 'docx',
                size: 512000,
                url: '/api/attachments/research-template.docx'
              }
            ],
            notes: ''
          }
        ]
      }
    ]
  },
  '3': {
    id: '3',
    title: 'Business Strategy and Planning',
    description: 'Learn how to create effective business strategies and implementation plans.',
    category: 'business',
    platform: 'LinkedIn Learning',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Michael Johnson',
    totalDuration: 15,
    enrollmentDate: '2025-06-20',
    lastAccessed: '2025-08-02',
    overallProgress: 85,
    modules: [
      {
        id: 'business-mod1',
        name: 'Strategic Planning',
        order: 1,
        userRating: 5,
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'business-lesson1',
            name: 'SWOT Analysis',
            description: 'Conducting comprehensive strength, weakness, opportunity, and threat analysis.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            duration: 20,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'business-att1',
                name: 'SWOT Template.xlsx',
                type: 'xlsx',
                size: 256000,
                url: '/api/attachments/swot-template.xlsx'
              }
            ],
            notes: 'SWOT Analysis framework:\n- Internal factors: Strengths & Weaknesses\n- External factors: Opportunities & Threats\n- Strategic implications for decision making'
          }
        ]
      }
    ]
  },
  '4': {
    id: '4',
    title: 'Spanish Language for Beginners',
    description: 'Start your journey learning Spanish with basic vocabulary and grammar.',
    category: 'language',
    platform: 'Duolingo',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Maria Garcia',
    totalDuration: 40,
    enrollmentDate: '2025-07-10',
    lastAccessed: '2025-07-30',
    overallProgress: 45,
    modules: [
      {
        id: 'spanish-mod1',
        name: 'Basic Vocabulary',
        order: 1,
        userRating: 4,
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'spanish-lesson1',
            name: 'Greetings and Introductions',
            description: 'Learn essential phrases for meeting people and basic conversations.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            duration: 15,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'spanish-att1',
                name: 'Common Phrases.pdf',
                type: 'pdf',
                size: 1024000,
                url: '/api/attachments/spanish-phrases.pdf'
              }
            ],
            notes: 'Basic Spanish greetings:\n- Hola = Hello\n- Buenos días = Good morning\n- ¿Cómo estás? = How are you?\n- Me llamo... = My name is...'
          }
        ]
      }
    ]
  },
  '5': {
    id: '5',
    title: 'Data Science with Python',
    description: 'Explore data analysis, machine learning, and statistical modeling using Python.',
    category: 'science',
    platform: 'edX',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Dr. Sarah Wilson',
    totalDuration: 35,
    enrollmentDate: '2025-06-15',
    lastAccessed: '2025-08-01',
    overallProgress: 60,
    modules: [
      {
        id: 'datascience-mod1',
        name: 'Python for Data Analysis',
        order: 1,
        userRating: 5,
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'datascience-lesson1',
            name: 'NumPy and Pandas',
            description: 'Working with numerical data and dataframes in Python.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: 30,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'datascience-att1',
                name: 'Sample Dataset.csv',
                type: 'csv',
                size: 2048000,
                url: '/api/attachments/sample-dataset.csv'
              },
              {
                id: 'datascience-att2',
                name: 'Pandas Cheatsheet.pdf',
                type: 'pdf',
                size: 1536000,
                url: '/api/attachments/pandas-cheatsheet.pdf'
              }
            ],
            notes: 'Key Python libraries for data science:\n- NumPy: Numerical operations\n- Pandas: Data manipulation\n- Matplotlib: Data visualization'
          }
        ]
      }
    ]
  },
  '6': {
    id: '6',
    title: 'Calculus and Linear Algebra',
    description: 'Mathematical foundations for engineering and computer science.',
    category: 'math',
    platform: 'Khan Academy',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Prof. Robert Chen',
    totalDuration: 30,
    enrollmentDate: '2025-07-05',
    lastAccessed: '2025-07-25',
    overallProgress: 20,
    modules: [
      {
        id: 'math-mod1',
        name: 'Limits and Derivatives',
        order: 1,
        userRating: 4,
        completed: false,
        progress: 40,
        lessons: [
          {
            id: 'math-lesson1',
            name: 'Introduction to Limits',
            description: 'Understanding the concept of limits and their applications.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            duration: 25,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'math-att1',
                name: 'Limit Theorems.pdf',
                type: 'pdf',
                size: 1800000,
                url: '/api/attachments/limit-theorems.pdf'
              }
            ],
            notes: 'Limit definition:\nlim(x→a) f(x) = L\n\nKey limit laws and their applications in calculus'
          }
        ]
      }
    ]
  },
  '7': {
    id: '7',
    title: 'World War II History',
    description: 'Comprehensive study of the causes, events, and consequences of WWII.',
    category: 'history',
    platform: 'MasterClass',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Dr. Elizabeth Harper',
    totalDuration: 20,
    enrollmentDate: '2025-06-01',
    lastAccessed: '2025-08-03',
    overallProgress: 90,
    modules: [
      {
        id: 'history-mod1',
        name: 'Pre-War Tensions',
        order: 1,
        userRating: 5,
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'history-lesson1',
            name: 'Rise of Fascism',
            description: 'Understanding the political and economic factors that led to fascist movements.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            duration: 35,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'history-att1',
                name: 'Timeline 1930-1939.pdf',
                type: 'pdf',
                size: 2200000,
                url: '/api/attachments/wwii-timeline.pdf'
              }
            ],
            notes: 'Key factors in rise of fascism:\n- Economic instability post-WWI\n- Nationalist movements\n- Political polarization\n- Propaganda techniques'
          }
        ]
      }
    ]
  },
  '8': {
    id: '8',
    title: 'Digital Art and Illustration',
    description: 'Create stunning digital artwork using modern tools and techniques.',
    category: 'art',
    platform: 'Skillshare',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Alexandra Martinez',
    totalDuration: 22,
    enrollmentDate: '2025-07-12',
    lastAccessed: '2025-07-29',
    overallProgress: 55,
    modules: [
      {
        id: 'art-mod1',
        name: 'Digital Drawing Basics',
        order: 1,
        userRating: 5,
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'art-lesson1',
            name: 'Photoshop for Beginners',
            description: 'Getting started with digital art tools and workspace setup.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
            duration: 28,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'art-att1',
                name: 'Photoshop Brushes Pack.zip',
                type: 'zip',
                size: 15360000,
                url: '/api/attachments/photoshop-brushes.zip'
              },
              {
                id: 'art-att2',
                name: 'Workspace Setup Guide.pdf',
                type: 'pdf',
                size: 1024000,
                url: '/api/attachments/workspace-setup.pdf'
              }
            ],
            notes: 'Essential Photoshop tools for digital art:\n- Brush tool variations\n- Layer management\n- Color picker and palettes\n- Transform tools'
          }
        ]
      }
    ]
  },
  '9': {
    id: '9',
    title: 'Advanced JavaScript Concepts',
    description: 'Deep dive into JavaScript including closures, prototypes, and async programming.',
    category: 'programming',
    platform: 'Pluralsight',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'David Kim',
    totalDuration: 28,
    enrollmentDate: '2025-07-08',
    lastAccessed: '2025-07-31',
    overallProgress: 40,
    modules: [
      {
        id: 'js-mod1',
        name: 'Closures and Scope',
        order: 1,
        userRating: 4,
        completed: false,
        progress: 65,
        lessons: [
          {
            id: 'js-lesson1',
            name: 'Understanding Closures',
            description: 'How closures work in JavaScript and their practical applications.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            duration: 22,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'js-att1',
                name: 'Closure Examples.js',
                type: 'js',
                size: 64000,
                url: '/api/attachments/closure-examples.js'
              }
            ],
            notes: 'Closure definition:\nA closure gives you access to an outer function\'s scope from an inner function.\n\nCommon use cases:\n- Data privacy\n- Module patterns\n- Callbacks and event handlers'
          }
        ]
      }
    ]
  },
  '10': {
    id: '10',
    title: 'Mobile App Design Patterns',
    description: 'Learn design patterns and best practices for mobile applications.',
    category: 'design',
    platform: 'Udemy',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Lisa Thompson',
    totalDuration: 16,
    enrollmentDate: '2025-07-18',
    lastAccessed: '2025-07-26',
    overallProgress: 15,
    modules: [
      {
        id: 'mobile-mod1',
        name: 'iOS Design Guidelines',
        order: 1,
        userRating: 0,
        completed: false,
        progress: 30,
        lessons: [
          {
            id: 'mobile-lesson1',
            name: 'Human Interface Guidelines',
            description: 'Understanding Apple\'s design principles for iOS applications.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: 20,
            completed: false,
            hasAttachments: true,
            attachments: [
              {
                id: 'mobile-att1',
                name: 'iOS Design Kit.sketch',
                type: 'sketch',
                size: 5120000,
                url: '/api/attachments/ios-design-kit.sketch'
              }
            ],
            notes: ''
          }
        ]
      }
    ]
  },
  '11': {
    id: '11',
    title: 'Financial Management',
    description: 'Master personal and business financial planning and management.',
    category: 'business',
    platform: 'Coursera',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'James Wilson',
    totalDuration: 18,
    enrollmentDate: '2025-06-25',
    lastAccessed: '2025-08-02',
    overallProgress: 70,
    modules: [
      {
        id: 'finance-mod1',
        name: 'Investment Fundamentals',
        order: 1,
        userRating: 5,
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'finance-lesson1',
            name: 'Portfolio Diversification',
            description: 'Strategies for building a balanced investment portfolio.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            duration: 24,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'finance-att1',
                name: 'Portfolio Calculator.xlsx',
                type: 'xlsx',
                size: 512000,
                url: '/api/attachments/portfolio-calculator.xlsx'
              }
            ],
            notes: 'Diversification principles:\n- Asset allocation strategies\n- Risk vs. return balance\n- Sector and geographic diversification\n- Rebalancing schedules'
          }
        ]
      }
    ]
  },
  '12': {
    id: '12',
    title: 'French Conversation Practice',
    description: 'Improve your French speaking skills through guided conversation practice.',
    category: 'language',
    platform: 'Babbel',
    thumbnail: '/api/placeholder/300/200',
    instructor: 'Pierre Dubois',
    totalDuration: 24,
    enrollmentDate: '2025-07-20',
    lastAccessed: '2025-07-27',
    overallProgress: 25,
    modules: [
      {
        id: 'french-mod1',
        name: 'Daily Conversations',
        order: 1,
        userRating: 4,
        completed: false,
        progress: 50,
        lessons: [
          {
            id: 'french-lesson1',
            name: 'At the Restaurant',
            description: 'Practice ordering food and interacting with restaurant staff in French.',
            order: 1,
            hasVideo: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: 18,
            completed: true,
            hasAttachments: true,
            attachments: [
              {
                id: 'french-att1',
                name: 'Restaurant Vocabulary.pdf',
                type: 'pdf',
                size: 768000,
                url: '/api/attachments/french-restaurant.pdf'
              }
            ],
            notes: 'Useful restaurant phrases:\n- Je voudrais... = I would like...\n- L\'addition, s\'il vous plaît = The check, please\n- C\'est délicieux = It\'s delicious'
          }
        ]
      }
    ]
  }
};

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

  static async getDetailedCourse(id: string): Promise<DetailedCourse | null> {
    await delay(800);
    return mockDetailedCourses[id] || null;
  }

  static async updateLessonNotes(courseId: string, lessonId: string, notes: string): Promise<boolean> {
    await delay(300);
    const course = mockDetailedCourses[courseId];
    if (course) {
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lesson.notes = notes;
          return true;
        }
      }
    }
    return false;
  }

  static async markLessonCompleted(courseId: string, lessonId: string): Promise<boolean> {
    await delay(300);
    const course = mockDetailedCourses[courseId];
    if (course) {
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lesson.completed = true;
          // Update module progress
          const completedLessons = module.lessons.filter(l => l.completed).length;
          module.progress = Math.round((completedLessons / module.lessons.length) * 100);
          module.completed = module.progress === 100;
          // Update overall course progress
          const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
          const totalCompleted = course.modules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);
          course.overallProgress = Math.round((totalCompleted / totalLessons) * 100);
          return true;
        }
      }
    }
    return false;
  }

  static async getFilterOptions(): Promise<{
    categories: string[];
    platforms: string[];
    languages: string[];
  }> {
    await delay(200);
    
    const categories = [...new Set(mockCourses.map(course => course.category))].sort();
    const platforms = [...new Set(mockCourses.map(course => course.platform))].sort();
    // Mock languages - in real app this could come from course data
    const languages = ['English', 'Spanish', 'French', 'German', 'Portuguese'].sort();
    
    return {
      categories,
      platforms,
      languages
    };
  }

  static async rateLessonAsync(courseId: string, lessonId: string, rating: number): Promise<boolean> {
    await delay(300);
    const course = mockDetailedCourses[courseId];
    if (course) {
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lesson.userRating = rating;
          return true;
        }
      }
    }
    return false;
  }

  static async toggleLessonCompletion(courseId: string, lessonId: string): Promise<boolean> {
    await delay(300);
    const course = mockDetailedCourses[courseId];
    if (course) {
      for (const module of course.modules) {
        const lesson = module.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lesson.completed = !lesson.completed;
          // Update module progress
          const completedLessons = module.lessons.filter(l => l.completed).length;
          module.progress = Math.round((completedLessons / module.lessons.length) * 100);
          module.completed = module.progress === 100;
          // Update overall course progress
          const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
          const totalCompleted = course.modules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);
          course.overallProgress = Math.round((totalCompleted / totalLessons) * 100);
          return true;
        }
      }
    }
    return false;
  }

  static async downloadModuleNotes(courseId: string, moduleId: string): Promise<string> {
    await delay(500);
    // In a real implementation, this would generate a PDF and return a download URL
    // For now, we'll return a mock URL
    return `/api/downloads/notes-${courseId}-${moduleId}.pdf`;
  }

  // Import/Upload methods
  static async importCourseFromUrl(courseData: ImportCourseData): Promise<{ success: boolean; courseId?: string; error?: string }> {
    await delay(1500);
    try {
      // Mock validation
      if (!courseData.title || !courseData.sourceUrl) {
        return { success: false, error: 'Title and source URL are required' };
      }

      // Check if it's a supported cloud storage URL
      const supportedDomains = ['drive.google.com', 'dropbox.com', 'onedrive.live.com', 'mega.nz', 'terabox.com', '1drv.ms'];
      const url = new URL(courseData.sourceUrl);
      const isCloudStorage = supportedDomains.some(domain => url.hostname.includes(domain));

      if (!isCloudStorage) {
        return { success: false, error: 'Unsupported cloud storage provider. Please use Google Drive, Dropbox, OneDrive, MEGA, Terabox, or similar services.' };
      }

      // Generate new course ID
      const newCourseId = `imported-${Date.now()}`;
      
      // Detect platform from URL
      let detectedPlatform = 'cloud-storage';
      if (url.hostname.includes('drive.google.com')) detectedPlatform = 'Google Drive';
      else if (url.hostname.includes('dropbox.com')) detectedPlatform = 'Dropbox';
      else if (url.hostname.includes('onedrive.live.com') || url.hostname.includes('1drv.ms')) detectedPlatform = 'OneDrive';
      else if (url.hostname.includes('mega.nz')) detectedPlatform = 'MEGA';
      else if (url.hostname.includes('terabox.com')) detectedPlatform = 'Terabox';
      
      // Add to mock courses (in real app, this would be a backend call)
      const newCourse: Course = {
        id: newCourseId,
        title: courseData.title,
        description: courseData.description || `Imported from ${detectedPlatform}${courseData.requiresAuth ? ' (with authentication)' : ''}`,
        category: courseData.category || 'other',
        platform: detectedPlatform,
        progress: 0,
        totalLessons: courseData.estimatedLessons || 1,
        duration: courseData.estimatedDuration || 60,
        difficulty: courseData.difficulty || 'beginner',
        lastAccessed: new Date().toISOString().split('T')[0],
      };

      mockCourses.unshift(newCourse);
      return { success: true, courseId: newCourseId };
    } catch (error) {
      return { success: false, error: 'Failed to import from cloud storage. Please check the URL and try again.' };
    }
  }

  static async uploadCourseFiles(courseData: ImportCourseData, files: FileList): Promise<{ success: boolean; courseId?: string; error?: string }> {
    await delay(2000);
    try {
      // Mock validation
      if (!courseData.title || files.length === 0) {
        return { success: false, error: 'Title and module files are required' };
      }

      // Validate that all files are ZIP files
      const nonZipFiles = Array.from(files).filter(file => !file.name.toLowerCase().endsWith('.zip'));
      if (nonZipFiles.length > 0) {
        return { success: false, error: 'Only ZIP files are allowed. Each ZIP should contain a complete module.' };
      }

      // Generate new course ID
      const newCourseId = `uploaded-${Date.now()}`;
      
      // Calculate estimated lessons based on number of modules (assuming average of 5 lessons per module)
      const estimatedLessonsFromModules = files.length * 5;
      
      // Add to mock courses
      const newCourse: Course = {
        id: newCourseId,
        title: courseData.title,
        description: courseData.description || `Course with ${files.length} modules uploaded`,
        category: courseData.category || 'other',
        platform: courseData.platform || 'uploaded',
        progress: 0,
        totalLessons: courseData.estimatedLessons || estimatedLessonsFromModules,
        duration: courseData.estimatedDuration || (files.length * 90), // Assume 90 min per module
        difficulty: courseData.difficulty || 'beginner',
        lastAccessed: new Date().toISOString().split('T')[0],
        fileSize: Array.from(files).reduce((total, file) => total + file.size, 0) / (1024 * 1024), // Convert to MB
      };

      mockCourses.unshift(newCourse);
      return { success: true, courseId: newCourseId };
    } catch (error) {
      return { success: false, error: 'Failed to upload course modules' };
    }
  }

  static async importFromFolder(courseData: ImportCourseData, folderPath: string, createWeakLink: boolean): Promise<{ success: boolean; courseId?: string; error?: string }> {
    await delay(1000);
    try {
      // Mock validation
      if (!courseData.title || !folderPath) {
        return { success: false, error: 'Title and folder path are required' };
      }

      // Generate new course ID
      const newCourseId = `folder-${Date.now()}`;
      
      // Add to mock courses
      const newCourse: Course = {
        id: newCourseId,
        title: courseData.title,
        description: courseData.description || `${createWeakLink ? 'Linked' : 'Imported'} from folder`,
        category: courseData.category || 'other',
        platform: courseData.platform || 'local',
        progress: 0,
        totalLessons: courseData.estimatedLessons || 10,
        duration: courseData.estimatedDuration || 60,
        difficulty: courseData.difficulty || 'beginner',
        lastAccessed: new Date().toISOString().split('T')[0],
      };

      mockCourses.unshift(newCourse);
      return { success: true, courseId: newCourseId };
    } catch (error) {
      return { success: false, error: 'Failed to import from folder' };
    }
  }

  static async importFromTelegram(courseData: ImportCourseData, telegramData: TelegramImportData): Promise<{ success: boolean; courseId?: string; error?: string }> {
    await delay(1500);
    try {
      // Mock validation
      if (!courseData.title || !telegramData.channelId) {
        return { success: false, error: 'Title and Telegram channel ID are required' };
      }

      // Validate authentication method
      if (telegramData.authMethod === 'bot' && !telegramData.botToken) {
        return { success: false, error: 'Bot token is required when using bot authentication' };
      }

      // Generate new course ID
      const newCourseId = `telegram-${Date.now()}`;
      
      // Create description based on auth method and content format
      const authMethodText = telegramData.authMethod === 'telethon' ? 'Telethon (User Auth)' : 'Bot Token';
      const contentFormatText = telegramData.contentFormat === 'zip' ? 'ZIP modules' : 'Stream format';
      
      // Add to mock courses
      const newCourse: Course = {
        id: newCourseId,
        title: courseData.title,
        description: courseData.description || `Imported from Telegram via ${authMethodText} in ${contentFormatText}`,
        category: courseData.category || 'other',
        platform: 'Telegram',
        progress: 0,
        totalLessons: courseData.estimatedLessons || 5,
        duration: courseData.estimatedDuration || 60,
        difficulty: courseData.difficulty || 'beginner',
        lastAccessed: new Date().toISOString().split('T')[0],
      };

      mockCourses.unshift(newCourse);
      return { success: true, courseId: newCourseId };
    } catch (error) {
      return { success: false, error: 'Failed to import from Telegram' };
    }
  }
}
