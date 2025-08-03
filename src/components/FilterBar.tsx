'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

interface FilterBarProps {
  selectedCategory: string;
  selectedPlatform: string;
  selectedDuration: string;
  availableCategories: string[];
  availablePlatforms: string[];
  onCategoryChange: (category: string) => void;
  onPlatformChange: (platform: string) => void;
  onDurationChange: (duration: string) => void;
}

export default function FilterBar({ 
  selectedCategory, 
  selectedPlatform,
  selectedDuration,
  availableCategories,
  availablePlatforms,
  onCategoryChange,
  onPlatformChange,
  onDurationChange
}: FilterBarProps) {
  const t = useTranslations('cognitahz');

  // Create category options with translations
  const categoryOptions = [
    { key: 'all', label: t('courses.allCategories') },
    ...availableCategories.map(category => ({
      key: category,
      label: t(`categories.${category}` as any) || category // Fallback to key if translation not found
    }))
  ];

  // Platform options (no translation needed as these are proper names)
  const platformOptions = [
    { key: 'all', label: t('courses.allPlatforms') },
    ...availablePlatforms.map(platform => ({
      key: platform,
      label: platform
    }))
  ];

  // Duration options
  const durationOptions = [
    { key: 'all', label: t('courses.allDurations') },
    { key: '0-20', label: t('courses.duration0to20') },
    { key: '20-40', label: t('courses.duration20to40') },
    { key: '40+', label: t('courses.duration40plus') }
  ];

  return (
    <div className="filter-bar">
      <div className="filter-header">
        <FontAwesomeIcon icon={faFilter} />
        <span>{t('courses.filters')}</span>
      </div>
      
      <div className="filter-section">
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

      <div className="filter-section">
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

      <div className="filter-section">
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
    </div>
  );
}
