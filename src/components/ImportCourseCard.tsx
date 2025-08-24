'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface ImportCourseCardProps {
  onClick: () => void;
}

export default function ImportCourseCard({ onClick }: ImportCourseCardProps) {
  const t = useTranslations('cognitahz.courses');

  return (
    <div className="import-course-card" onClick={onClick}>
      <div className="import-course-content">
        <div className="import-course-icon">
          <FontAwesomeIcon icon={faPlus} size="3x" />
        </div>
        <h3 className="import-course-title">{t('importUpload')}</h3>
        <p className="import-course-description">{t('importDescription')}</p>
      </div>
    </div>
  );
}
