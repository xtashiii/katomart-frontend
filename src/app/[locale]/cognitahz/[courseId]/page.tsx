'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/auth';
import Header from '@/components/Header';
import CourseTreeSidebar from '@/components/CourseTreeSidebar';
import CourseContent from '@/components/CourseContent';
import { CoursesAPI } from '@/lib/api';
import { DetailedCourse, Lesson } from '@/app/api/courses/types';

export default function CoursePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<DetailedCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const { isLoggedIn, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('course');
  
  const courseId = params.courseId as string;

  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const courseData = await CoursesAPI.getDetailedCourse(courseId);
      if (courseData) {
        setCourse(courseData);
        if (courseData.modules.length > 0 && courseData.modules[0].lessons.length > 0) {
          setSelectedLesson(courseData.modules[0].lessons[0]);
        }
      } else {
        setError(t('notFound'));
      }
    } catch (err) {
      setError(t('error'));
      console.error('Failed to load course:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, t]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const checkAuthAndLoadCourse = async () => {
      if (!authLoading && !isLoggedIn) {
        router.push('/');
        return;
      }

      if (isLoggedIn && !authLoading) {
        const isValid = await verifyAuth();
        if (!isValid) {
          logout();
          router.push('/');
          return;
        }

        await loadCourse();
      }
    };

    checkAuthAndLoadCourse();
  }, [isLoggedIn, authLoading, courseId, logout, router, loadCourse]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [toggleSidebar]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [sidebarOpen, toggleSidebar]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleNotesUpdate = async (lessonId: string, notes: string) => {
    if (!course) return;
    
    try {
      await CoursesAPI.updateLessonNotes(course.id, lessonId, notes);
      const updatedCourse = { ...course };
      for (const courseModule of updatedCourse.modules) {
        const lesson = courseModule.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lesson.notes = notes;
          break;
        }
      }
      setCourse(updatedCourse);
      if (selectedLesson && selectedLesson.id === lessonId) {
        setSelectedLesson({ ...selectedLesson, notes });
      }
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (!course) return;
    
    try {
      await CoursesAPI.markLessonCompleted(course.id, lessonId);
      await loadCourse();
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    }
  };

  const handleLessonRate = async (lessonId: string, rating: number) => {
    if (!course) return;
    
    try {
      if ('rateLessonContent' in CoursesAPI && typeof (CoursesAPI as { rateLessonContent?: (courseId: string, lessonId: string, rating: number) => Promise<void> }).rateLessonContent === 'function') {
        await (CoursesAPI as { rateLessonContent: (courseId: string, lessonId: string, rating: number) => Promise<void> }).rateLessonContent(course.id, lessonId, rating);
      } else {
        console.log('Rating lesson:', lessonId, 'with rating:', rating);
      }
      
      const updatedCourse = { ...course };
      for (const courseModule of updatedCourse.modules) {
        const lesson = courseModule.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lesson.userRating = rating;
          break;
        }
      }
      setCourse(updatedCourse);
      if (selectedLesson && selectedLesson.id === lessonId) {
        setSelectedLesson({ ...selectedLesson, userRating: rating });
      }
    } catch (err) {
      console.error('Failed to rate lesson:', err);
    }
  };

  const handleMarkersUpdate = async (lessonId: string, markers: unknown[]) => {
    if (!course) return;
    
    try {
      if ('updateLessonMarkers' in CoursesAPI && typeof (CoursesAPI as { updateLessonMarkers?: (courseId: string, lessonId: string, markers: unknown[]) => Promise<void> }).updateLessonMarkers === 'function') {
        await (CoursesAPI as { updateLessonMarkers: (courseId: string, lessonId: string, markers: unknown[]) => Promise<void> }).updateLessonMarkers(course.id, lessonId, markers);
      } else {
        // For now, just update local state until API method is implemented
        console.log('Updating markers for lesson:', lessonId, markers);
      }
      
      const updatedCourse = { ...course };
      for (const courseModule of updatedCourse.modules) {
        const lesson = courseModule.lessons.find(l => l.id === lessonId);
        if (lesson) {
          (lesson as { videoMarkers?: unknown[] }).videoMarkers = markers;
          break;
        }
      }
      setCourse(updatedCourse);
      if (selectedLesson && selectedLesson.id === lessonId) {
        setSelectedLesson({ ...selectedLesson, videoMarkers: markers } as Lesson & { videoMarkers?: unknown[] });
      }
    } catch (err) {
      console.error('Failed to update markers:', err);
    }
  };

  const handleBackToCourses = () => {
    router.push('/cognitahz');
  };

  if (isLoading || authLoading) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div className="course-loading">
            <div className="loading-spinner"></div>
            <p>{t('loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div className="course-error">
            <h1>{error}</h1>
            <button onClick={handleBackToCourses} className="back-button">
              {t('backToCourses')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div className="course-error">
            <h1>{t('notFound')}</h1>
            <button onClick={handleBackToCourses} className="back-button">
              {t('backToCourses')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="course-page">
      <Header />
      
      {/* Mobile sidebar toggle - only show on mobile */}
      {isMobile && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
      )}
      
      {/* Mobile sidebar overlay - only show on mobile */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={closeSidebar}
        ></div>
      )}
      
      <main className="course-main">
        <CourseTreeSidebar 
          course={course}
          selectedLesson={selectedLesson}
          onLessonSelect={(lesson: Lesson) => {
            handleLessonSelect(lesson);
            if (isMobile) {
              closeSidebar();
            }
          }}
          onBackToCourses={handleBackToCourses}
          onToggleCompletion={handleLessonComplete}
          className={`${isMobile && !sidebarOpen ? 'mobile-hidden' : ''}`}
        />
        <CourseContent 
          course={course}
          selectedLesson={selectedLesson}
          onNotesUpdate={handleNotesUpdate}
          onLessonComplete={handleLessonComplete}
          onLessonRate={handleLessonRate}
          onMarkersUpdate={handleMarkersUpdate}
        />
      </main>
    </div>
  );
}
