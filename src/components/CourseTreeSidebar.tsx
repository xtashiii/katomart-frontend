'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faPlay, 
  faCheck, 
  faStar, 
  faBook, 
  faChevronDown, 
  faChevronRight,
  faVideo,
  faPaperclip,
  faDownload,
  faCheckCircle,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { DetailedCourse, Lesson, Module } from '@/lib/coursesAPI';

interface CourseTreeSidebarProps {
  course: DetailedCourse;
  selectedLesson: Lesson | null;
  onLessonSelect: (lesson: Lesson) => void;
  onBackToCourses: () => void;
  onToggleCompletion?: (lessonId: string) => void;
  onDownloadNotes?: (moduleId: string) => void;
  className?: string;
}

export default function CourseTreeSidebar({ 
  course, 
  selectedLesson, 
  onLessonSelect, 
  onBackToCourses,
  onToggleCompletion,
  onDownloadNotes,
  className = ''
}: CourseTreeSidebarProps) {
  const t = useTranslations('course');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(course.modules.map(m => m.id)) // Expand all modules by default
  );
  const [ratings, setRatings] = useState<{ [lessonId: string]: number }>({});

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number, lessonId: string) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={`star ${i < rating ? 'filled' : 'empty'}`}
        onClick={() => handleRatingChange(lessonId, i + 1)}
      />
    ));
  };

  const calculateModuleRating = (module: Module) => {
    const ratedLessons = module.lessons.filter(lesson => lesson.userRating && lesson.userRating > 0);
    if (ratedLessons.length === 0) return 0;
    const totalRating = ratedLessons.reduce((sum, lesson) => sum + (lesson.userRating || 0), 0);
    return Math.round(totalRating / ratedLessons.length);
  };

  const isModuleCompleted = (module: Module) => {
    return module.lessons.every(lesson => lesson.completed);
  };

  const handleDownloadNotes = (moduleId: string) => {
    if (onDownloadNotes) {
      onDownloadNotes(moduleId);
    }
  };

  const handleToggleCompletion = (lesson: Lesson, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onToggleCompletion) {
      onToggleCompletion(lesson.id);
    }
  };

  const handleRatingChange = (lessonId: string, newRating: number) => {
    setRatings((prevRatings) => ({ ...prevRatings, [lessonId]: newRating }));
  };

  return (
    <div className={`course-tree-sidebar ${className}`}>
      <div className="sidebar-header">
        <button 
          onClick={onBackToCourses}
          className="back-button"
          aria-label={t('backToCourses')}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>{t('backToCourses')}</span>
        </button>
      </div>

      <div className="course-overview">
        <div className="course-thumbnail">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} />
          ) : (
            <div className="course-thumbnail-placeholder">
              <FontAwesomeIcon icon={faBook} size="2x" />
            </div>
          )}
        </div>
        
        <h1 className="course-title">{course.title}</h1>
        
        <div className="course-meta">
          <div className="meta-item">
            <strong>{t('instructor')}:</strong> {course.instructor}
          </div>
          <div className="meta-item">
            <strong>{t('enrolled')}:</strong> {formatDate(course.enrollmentDate)}
          </div>
          <div className="meta-item">
            <strong>{t('lastAccessed')}:</strong> {formatDate(course.lastAccessed)}
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-label">
            <strong>{t('overallProgress')}</strong>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${course.overallProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">{course.overallProgress}%</div>
        </div>
      </div>

      <div className="modules-section">
        <h2 className="section-title">{t('modules')}</h2>
        
        <div className="modules-list">
          {course.modules
            .sort((a, b) => a.order - b.order)
            .map((module, moduleIndex) => {
              const moduleRating = calculateModuleRating(module);
              const moduleCompleted = isModuleCompleted(module);
              return (
                <div key={module.id} className="module-item">
                  <div 
                    className="module-header"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="module-toggle">
                      <FontAwesomeIcon 
                        icon={expandedModules.has(module.id) ? faChevronDown : faChevronRight}
                      />
                    </div>
                    
                    <div className="module-info">
                      <h3 className="module-name">
                        <span className="module-order">{moduleIndex + 1}.</span> {module.name}
                      </h3>
                      <div className="module-meta">
                        <div className="module-progress">
                          <div className="mini-progress-bar">
                            <div 
                              className="mini-progress-fill"
                              style={{ width: `${module.progress}%` }}
                            ></div>
                          </div>
                          <span>{module.progress}%</span>
                        </div>
                        {moduleCompleted && (
                          <span className="module-completed">
                            <FontAwesomeIcon icon={faCheck} />
                            {t('moduleCompleted')}
                          </span>
                        )}
                      </div>
                      {moduleRating > 0 && (
                        <div className="module-rating">
                          {renderStars(moduleRating, module.id)}
                        </div>
                      )}
                    </div>

                    <div className="module-actions">
                      <button
                        className="download-notes-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadNotes(module.id);
                        }}
                        title="Download module notes as PDF"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </div>
                  </div>

                  {expandedModules.has(module.id) && (
                    <div className="lessons-list">
                      {module.lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson, lessonIndex) => (
                          <div 
                            key={lesson.id}
                            className={`lesson-item ${selectedLesson?.id === lesson.id ? 'selected' : ''}`}
                            onClick={() => onLessonSelect(lesson)}
                          >
                            <div className="lesson-order">
                              {moduleIndex + 1}.{lessonIndex + 1}
                            </div>
                            
                            <div className="lesson-icon">
                              {lesson.completed ? (
                                <FontAwesomeIcon icon={faCheck} className="completed-icon" />
                              ) : lesson.hasVideo ? (
                                <FontAwesomeIcon icon={faVideo} className="video-icon" />
                              ) : (
                                <FontAwesomeIcon icon={faPlay} className="play-icon" />
                              )}
                            </div>
                            
                            <div className="lesson-info">
                              <div className="lesson-name">{lesson.name}</div>
                              <div className="lesson-meta">
                                {lesson.duration && (
                                  <span className="lesson-duration">
                                    {t('duration', { minutes: lesson.duration })}
                                  </span>
                                )}
                                {lesson.hasAttachments && (
                                  <span className="lesson-attachments">
                                    <FontAwesomeIcon icon={faPaperclip} />
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="lesson-actions">
                              <button
                                className={`completion-toggle ${lesson.completed ? 'completed' : 'incomplete'}`}
                                onClick={(e) => handleToggleCompletion(lesson, e)}
                                title={lesson.completed ? 'Mark as incomplete' : 'Mark as complete'}
                              >
                                <FontAwesomeIcon icon={lesson.completed ? faCheckCircle : faCircle} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
