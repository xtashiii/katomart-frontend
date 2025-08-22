import { Course, DetailedCourse } from './types';

export const mockCourses: Course[] = [
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
    fileSize: 1250,
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
    fileSize: 450,
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

export const mockDetailedCourses: { [key: string]: DetailedCourse } = {
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
  }
};
