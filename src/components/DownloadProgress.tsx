'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface Lesson {
  id: string;
  name: string;
}
interface Module {
  id: string;
  name: string;
  lessons: Lesson[];
}
interface Course {
  id: string;
  name: string;
  modules: Module[];
}

interface DownloadProgressProps {
  courses: Course[];
  selectedItems: Record<string, boolean>;
  progress: Record<string, number>;
  running: boolean;
  paused: boolean;
  finished: boolean;
  onPause: () => void;
  onStop: () => void;
  onReauth: () => void;
}

export default function DownloadProgress({
  courses,
  selectedItems,
  progress,
  running,
  paused,
  finished,
  onPause,
  onStop,
  onReauth,
}: DownloadProgressProps) {
  const t = useTranslations('progress');
  // Helper function to check if an item is selected
  const isSelected = (id: string) => selectedItems[id] === true;
  
  // Calculate totals only for selected items
  const getLessonProgress = (lessonId: string) => progress[lessonId] || 0;
  
  const getModuleProgress = (module: Module) => {
    const selectedLessons = module.lessons.filter(lesson => isSelected(lesson.id));
    if (!selectedLessons.length) return 0;
    return (
      selectedLessons.reduce((sum, l) => sum + getLessonProgress(l.id), 0) / selectedLessons.length
    );
  };
  
  const getCourseProgress = (course: Course) => {
    const allLessons = course.modules.flatMap(m => m.lessons);
    const selectedLessons = allLessons.filter(lesson => isSelected(lesson.id));
    if (!selectedLessons.length) return 0;
    return selectedLessons.reduce((sum, l) => sum + getLessonProgress(l.id), 0) / selectedLessons.length;
  };
  
  // Check if module has any selected lessons
  const hasSelectedLessons = (module: Module) => {
    return module.lessons.some(lesson => isSelected(lesson.id));
  };
  
  // Check if course has any selected lessons
  const hasSelectedContent = (course: Course) => {
    return course.modules.some(module => hasSelectedLessons(module));
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={onPause} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded" disabled={!running}>{paused ? t('resume') : t('pause')}</button>
        <button onClick={onReauth} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded">{t('reauth')}</button>
        <button onClick={onStop} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">{t('stop')}</button>
      </div>
      {courses.filter(course => hasSelectedContent(course)).map(course => (
        <div key={course.id} className="mb-6 border rounded-lg bg-gray-50">
          <div className="px-4 pt-4 pb-2 font-bold text-primary-dark flex items-center">
            <span className="mr-2">{course.name}</span>
            <span className="ml-auto text-xs text-gray-500">{getCourseProgress(course).toFixed(0)}%</span>
          </div>
          <div className="px-4 pb-2">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${getCourseProgress(course)}%` }}></div>
            </div>
          </div>
          <div className="ml-6">
            {course.modules.filter(module => hasSelectedLessons(module)).map(module => (
              <div key={module.id} className="mb-4">
                <div className="font-semibold text-gray-700 flex items-center">
                  <span>{module.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{getModuleProgress(module).toFixed(0)}%</span>
                </div>
                <div className="w-11/12 bg-gray-200 rounded-full h-2 mt-1 mb-2 ml-1">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${getModuleProgress(module)}%` }}></div>
                </div>
                <div className="ml-6">
                  {module.lessons.filter(lesson => isSelected(lesson.id)).map(lesson => (
                    <div key={lesson.id} className="flex items-center mb-1">
                      <span className="w-2 h-2 rounded-full mr-2" style={{ background: getLessonProgress(lesson.id) === 100 ? '#22c55e' : '#e5e7eb' }}></span>
                      <span className="flex-1 text-gray-600">{lesson.name}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-1 mx-2">
                        <div className="bg-indigo-500 h-1 rounded-full transition-all duration-300" style={{ width: `${getLessonProgress(lesson.id)}%` }}></div>
                      </div>
                      <span className="ml-auto text-xs text-gray-500">{getLessonProgress(lesson.id).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {finished && <div className="text-green-600 font-bold text-center mt-4">{t('complete')}</div>}
    </div>
  );
}
