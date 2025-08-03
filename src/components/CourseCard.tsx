'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faClock, faChartLine } from '@fortawesome/free-solid-svg-icons';

interface Course {
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

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const t = useTranslations('cognitahz.courseCard');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div 
      className="course-card"
      onClick={() => onClick(course)}
    >
      <div className="course-thumbnail">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} />
        ) : (
          <div className="course-thumbnail-placeholder">
            <FontAwesomeIcon icon={faBook} size="2x" />
          </div>
        )}
      </div>
      
      <div className="course-content">
        <div className="course-header">
          <h3 className="course-title">{course.title}</h3>
          <span 
            className="course-difficulty"
            style={{ backgroundColor: getDifficultyColor(course.difficulty) }}
          >
            {t('difficulty', { level: course.difficulty })}
          </span>
        </div>
        
        <p className="course-description">{course.description}</p>
        <div className="course-tags">
          <span className="course-category">{course.category}</span>
          <span className="course-platform">{course.platform}</span>
        </div>
        
        <div className="course-stats">
          <div className="course-stat">
            <FontAwesomeIcon icon={faBook} />
            <span>{t('lessons', { count: course.totalLessons })}</span>
          </div>
          <div className="course-stat">
            <FontAwesomeIcon icon={faClock} />
            <span>{t('duration', { duration: course.duration })}</span>
          </div>
        </div>
        
        <div className="course-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {t('progress', { percent: course.progress })}
          </span>
        </div>
        
        {course.lastAccessed && (
          <div className="course-last-accessed">
            {t('lastAccessed', { date: formatDate(course.lastAccessed) })}
          </div>
        )}
      </div>
    </div>
  );
}
