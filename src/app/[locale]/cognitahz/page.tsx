'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/auth';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import CourseCard from '@/components/CourseCard';
import ImportCourseCard from '@/components/ImportCourseCard';
import Pagination from '@/components/Pagination';
import { CoursesAPI, Course, CoursesResponse } from '@/lib/coursesAPI';

export default function CognitahzPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [coursesData, setCoursesData] = useState<CoursesResponse | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoggedIn, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('cognitahz');

  const coursesPerPage = 6;

  useEffect(() => {
    const checkAuth = async () => {
      // Only redirect if we're sure the user is not logged in and not loading
      if (!authLoading && !isLoggedIn) {
        router.push('/');
        return;
      }

      // Only proceed with auth verification if we have a user
      if (isLoggedIn && !authLoading) {
        const isValid = await verifyAuth();
        if (!isValid) {
          logout();
          router.push('/');
          return;
        }

        setIsLoading(false);
        // Load filter options and initial courses
        await loadFilterOptions();
        loadCourses();
      } else if (!authLoading) {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isLoggedIn, authLoading, logout, router]); // Add authLoading to dependencies

  const loadFilterOptions = async () => {
    try {
      const filterOptions = await CoursesAPI.getFilterOptions();
      setAvailableCategories(filterOptions.categories);
      setAvailablePlatforms(filterOptions.platforms);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const loadCourses = async (
    page = 1, 
    search = searchQuery, 
    category = selectedCategory,
    platform = selectedPlatform,
    duration = selectedDuration
  ) => {
    setLoadingCourses(true);
    setError(null);
    
    try {
      const data = await CoursesAPI.getCourses({
        page,
        limit: coursesPerPage,
        search,
        category,
        platform,
        durationRange: duration
      });
      setCoursesData(data);
    } catch (err) {
      setError(t('courses.error'));
      console.error('Failed to load courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    loadCourses(1, query, selectedCategory, selectedPlatform, selectedDuration);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    loadCourses(1, searchQuery, category, selectedPlatform, selectedDuration);
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setCurrentPage(1);
    loadCourses(1, searchQuery, selectedCategory, platform, selectedDuration);
  };

  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration);
    setCurrentPage(1);
    loadCourses(1, searchQuery, selectedCategory, selectedPlatform, duration);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCourses(page, searchQuery, selectedCategory, selectedPlatform, selectedDuration);
    // Scroll to top of courses section
    document.querySelector('.courses-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCourseClick = (course: Course) => {
    // TODO: Navigate to course detail page
    console.log('Clicked course:', course.id);
  };

  const handleImportCourse = () => {
    // TODO: Open import/upload modal
    console.log('Import course clicked');
  };

  if (isLoading || authLoading) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div className="content-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  const getPaginationText = () => {
    if (!coursesData) return '';
    
    const start = (currentPage - 1) * coursesPerPage + 1;
    const end = Math.min(currentPage * coursesPerPage, coursesData.total);
    
    return t('pagination.showing', {
      start,
      end,
      total: coursesData.total
    });
  };

  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="cognitahz-container">
          {/* Hero Section */}
          <div className="cognitahz-hero">
            <h1 className="cognitahz-title">{t('title')}</h1>
            <p className="cognitahz-subtitle">{t('subtitle')}</p>
            <p className="cognitahz-welcome">{t('welcome')}</p>
          </div>

          {/* Search and Filters */}
          <div className="cognitahz-controls">
            <div className="search-section">
              <SearchBar
                placeholder={t('courses.searchPlaceholder')}
                onSearch={handleSearch}
                value={searchQuery}
              />
            </div>
            
            <div className="filter-section">
              <FilterBar
                selectedCategory={selectedCategory}
                selectedPlatform={selectedPlatform}
                selectedDuration={selectedDuration}
                availableCategories={availableCategories}
                availablePlatforms={availablePlatforms}
                onCategoryChange={handleCategoryChange}
                onPlatformChange={handlePlatformChange}
                onDurationChange={handleDurationChange}
              />
            </div>
          </div>

          {/* Courses Section */}
          <div className="courses-section">
            <div className="courses-header">
              <h2>{t('courses.title')}</h2>
              {coursesData && (
                <span className="courses-count">
                  {t('courses.resultsCount', { count: coursesData.total })}
                </span>
              )}
            </div>

            {/* Loading State */}
            {loadingCourses && (
              <div className="courses-loading">
                <div className="loading-spinner"></div>
                <p>{t('courses.loading')}</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="courses-error">
                <p>{error}</p>
              </div>
            )}

            {/* Courses Grid */}
            {!loadingCourses && !error && coursesData && (
              <>
                <div className="courses-grid">
                  {/* Import Course Card (always first) */}
                  <ImportCourseCard onClick={handleImportCourse} />
                  
                  {/* Course Cards */}
                  {coursesData.courses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onClick={handleCourseClick}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {coursesData.courses.length === 0 && (
                  <div className="courses-empty">
                    <p>{t('courses.empty')}</p>
                  </div>
                )}

                {/* Pagination */}
                {coursesData.totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={coursesData.totalPages}
                    onPageChange={handlePageChange}
                    showingText={getPaginationText()}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
