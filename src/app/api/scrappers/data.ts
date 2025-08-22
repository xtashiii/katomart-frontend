import { ScrapperPlatform, DownloadConfig, ScrapperCourse } from './types';

export const defaultDownloadConfig: DownloadConfig = {
  filePattern: '%(title)s.%(ext)s',
  maxConcurrent: 3,
  allowedTypes: 'mp4, mp3, pdf',
  ffmpegArgs: '',
  downloadPath: '/path/to/downloads',
  createSubfolders: true,
};

export const scraperPlatforms: ScrapperPlatform[] = [
  { id: 'udemy', name: 'Udemy' },
  { id: 'coursera', name: 'Coursera' },
  {
    id: 'edx',
    name: 'edX',
    needsLoginUrl: true,
    needsBaseUrl: true,
    loginUrlLabel: 'Institution Login URL',
    baseUrlLabel: 'Course Base URL',
  },
  { id: 'skillshare', name: 'Skillshare' },
  { id: 'pluralsight', name: 'Pluralsight' },
];

export const scrapperCourses: ScrapperCourse[] = [
  {
    id: '1',
    name: 'Complete React Developer Course',
    modules: [
      {
        id: '1-1',
        name: 'React Fundamentals',
        lessons: [
          { id: '1-1-1', name: 'Introduction to React' },
          { id: '1-1-2', name: 'JSX and Components' },
          { id: '1-1-3', name: 'Props and State' },
        ],
      },
      {
        id: '1-2',
        name: 'Advanced React Concepts',
        lessons: [
          { id: '1-2-1', name: 'Hooks and Context' },
          { id: '1-2-2', name: 'Performance Optimization' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Node.js Masterclass',
    modules: [
      {
        id: '2-1',
        name: 'Node.js Basics',
        lessons: [
          { id: '2-1-1', name: 'Setting up Node.js' },
          { id: '2-1-2', name: 'Working with Modules' },
          { id: '2-1-3', name: 'File System Operations' },
        ],
      },
      {
        id: '2-2',
        name: 'Express.js Framework',
        lessons: [
          { id: '2-2-1', name: 'Creating REST APIs' },
          { id: '2-2-2', name: 'Middleware and Authentication' },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Python for Data Science',
    modules: [
      {
        id: '3-1',
        name: 'Python Fundamentals',
        lessons: [
          { id: '3-1-1', name: 'Variables and Data Types' },
          { id: '3-1-2', name: 'Control Structures' },
        ],
      },
      {
        id: '3-2',
        name: 'Data Analysis with Pandas',
        lessons: [
          { id: '3-2-1', name: 'DataFrames and Series' },
          { id: '3-2-2', name: 'Data Cleaning Techniques' },
          { id: '3-2-3', name: 'Statistical Analysis' },
        ],
      },
    ],
  },
];
