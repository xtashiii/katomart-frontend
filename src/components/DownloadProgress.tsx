'use client';

import React from 'react';

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
  // Calculate totals
  const getLessonProgress = (lessonId: string) => progress[lessonId] || 0;
  const getModuleProgress = (module: Module) => {
    if (!module.lessons.length) return 0;
    return (
      module.lessons.reduce((sum, l) => sum + getLessonProgress(l.id), 0) / module.lessons.length
    );
  };
  const getCourseProgress = (course: Course) => {
    const lessons = course.modules.flatMap(m => m.lessons);
    if (!lessons.length) return 0;
    return lessons.reduce((sum, l) => sum + getLessonProgress(l.id), 0) / lessons.length;
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={onPause} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded" disabled={!running}>{paused ? 'Resume' : 'Pause'}</button>
        <button onClick={onReauth} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded">Re-authenticate</button>
        <button onClick={onStop} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">Stop</button>
      </div>
      {courses.map(course => (
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
            {course.modules.map(module => (
              <div key={module.id} className="mb-4">
                <div className="font-semibold text-gray-700 flex items-center">
                  <span>{module.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{getModuleProgress(module).toFixed(0)}%</span>
                </div>
                <div className="w-11/12 bg-gray-200 rounded-full h-2 mt-1 mb-2 ml-1">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${getModuleProgress(module)}%` }}></div>
                </div>
                <div className="ml-6">
                  {module.lessons.map(lesson => (
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
      {finished && <div className="text-green-600 font-bold text-center mt-4">Download Complete!</div>}
    </div>
  );
}
