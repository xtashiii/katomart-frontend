'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface FilterBarProps {
  selectedCategory: string;
  selectedPlatform: string;
  selectedDuration: string;
  selectedFileSize: string;
  selectedDownloadStatus: string;
  selectedLastUpdated: string;
  selectedLanguage: string;
  selectedProgress: string;
  availableCategories: string[];
  availablePlatforms: string[];
  availableLanguages: string[];
  onCategoryChange: (category: string) => void;
  onPlatformChange: (platform: string) => void;
  onDurationChange: (duration: string) => void;
  onFileSizeChange: (fileSize: string) => void;
  onDownloadStatusChange: (status: string) => void;
  onLastUpdatedChange: (lastUpdated: string) => void;
  onLanguageChange: (language: string) => void;
  onProgressChange: (progress: string) => void;
}

export default function FilterBar({ 
  selectedCategory, 
  selectedPlatform,
  selectedDuration,
  selectedFileSize,
  selectedDownloadStatus,
  selectedLastUpdated,
  selectedLanguage,
  selectedProgress,
  availableCategories,
  availablePlatforms,
  availableLanguages,
  onCategoryChange,
  onPlatformChange,
  onDurationChange,
  onFileSizeChange,
  onDownloadStatusChange,
  onLastUpdatedChange,
  onLanguageChange,
  onProgressChange
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations('cognitahz');

  const categoryOptions = [
    { key: 'all', label: t('courses.allCategories') },
    ...availableCategories.map(category => ({
      key: category,
      label: t(`categories.${category}` as any) || category
    }))
  ];

  const platformOptions = [
    { key: 'all', label: t('courses.allPlatforms') },
    ...availablePlatforms.map(platform => ({
      key: platform,
      label: platform
    }))
  ];

  const durationOptions = [
    { key: 'all', label: t('courses.allDurations') },
    { key: '0-20', label: t('courses.duration0to20') },
    { key: '20-40', label: t('courses.duration20to40') },
    { key: '40+', label: t('courses.duration40plus') }
  ];

  const fileSizeOptions = [
    { key: 'all', label: t('courses.allFileSizes') },
    { key: 'small', label: t('courses.fileSizeSmall') },
    { key: 'medium', label: t('courses.fileSizeMedium') },
    { key: 'large', label: t('courses.fileSizeLarge') }
  ];

  const downloadStatusOptions = [
    { key: 'all', label: t('courses.allDownloadStatuses') },
    { key: 'complete', label: t('courses.downloadComplete') },
    { key: 'partial', label: t('courses.downloadPartial') },
    { key: 'missing', label: t('courses.downloadMissing') }
  ];

  const lastUpdatedOptions = [
    { key: 'all', label: t('courses.allLastUpdated') },
    { key: 'week', label: t('courses.lastWeek') },
    { key: 'month', label: t('courses.lastMonth') },
    { key: '3months', label: t('courses.last3Months') },
    { key: 'older', label: t('courses.older') }
  ];

  const languageOptions = [
    { key: 'all', label: t('courses.allLanguages') },
    ...availableLanguages.map(language => ({
      key: language,
      label: language
    }))
  ];

  const progressOptions = [
    { key: 'all', label: t('courses.allProgress') },
    { key: 'not-started', label: t('courses.notStarted') },
    { key: 'in-progress', label: t('courses.inProgress') },
    { key: 'completed', label: t('courses.completed') },
    { key: 'bookmarked', label: t('courses.bookmarked') }
  ];

  return (
    <div className="filter-bar">
      <div 
        className="filter-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faFilter} />
        <span>{t('courses.filters')}</span>
        <FontAwesomeIcon 
          icon={isExpanded ? faChevronUp : faChevronDown} 
          className="filter-toggle-icon"
        />
      </div>
      
      <div className={`filter-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="filter-grid">
          <div className="filter-item">
            <label className="filter-label">{t('courses.category')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="filter-select"
            >
              {categoryOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">{t('courses.platform')}</label>
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="filter-select"
            >
              {platformOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">{t('courses.duration')}</label>
            <select
              value={selectedDuration}
              onChange={(e) => onDurationChange(e.target.value)}
              className="filter-select"
            >
              {durationOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">{t('courses.fileSize')}</label>
            <select
              value={selectedFileSize}
              onChange={(e) => onFileSizeChange(e.target.value)}
              className="filter-select"
            >
              {fileSizeOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">{t('courses.downloadStatus')}</label>
            <select
              value={selectedDownloadStatus}
              onChange={(e) => onDownloadStatusChange(e.target.value)}
              className="filter-select"
            >
              {downloadStatusOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">{t('courses.lastUpdated')}</label>
            <select
              value={selectedLastUpdated}
              onChange={(e) => onLastUpdatedChange(e.target.value)}
              className="filter-select"
            >
              {lastUpdatedOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">{t('courses.language')}</label>
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="filter-select"
            >
              {languageOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">{t('courses.progress')}</label>
            <select
              value={selectedProgress}
              onChange={(e) => onProgressChange(e.target.value)}
              className="filter-select"
            >
              {progressOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
