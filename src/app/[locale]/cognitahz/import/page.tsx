'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/auth';
import Header from '@/components/Header';
import { CoursesAPI } from '@/lib/api';
import { ImportCourseData, TelegramImportData } from '@/app/api/courses/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faLink, 
  faFolder,
  faCloudUploadAlt,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faTimes,
  faComments
} from '@fortawesome/free-solid-svg-icons';

type ImportTab = 'upload' | 'url' | 'telegram' | 'folder';

interface ImportFormData extends ImportCourseData {
  sourceUrl?: string;
  folderPath?: string;
  createWeakLink?: boolean;
  requiresAuth?: boolean;
  telegramData?: TelegramImportData;
}

export default function ImportCoursePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ImportTab>('upload');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [folderScanResults, setFolderScanResults] = useState<string[]>([]);
  const [isScanningFolder, setIsScanningFolder] = useState(false);

  const [formData, setFormData] = useState<ImportFormData>({
    title: '',
    description: '',
    category: 'other',
    platform: 'imported',
    difficulty: 'beginner',
    estimatedLessons: 1,
    estimatedDuration: 60,
    instructor: '',
    language: 'en',
    sourceUrl: '',
    folderPath: '',
    createWeakLink: true,
    requiresAuth: false,
    telegramData: {
      channelId: '',
      authMethod: 'bot',
      botToken: '',
      contentFormat: 'stream',
      messageRange: { start: undefined, end: undefined },
      filterKeywords: []
    }
  });

  const { isLoggedIn, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('import');
  const tCommon = useTranslations('import.common');
  const tGeneral = useTranslations('general');

  useEffect(() => {
    const checkAuth = async () => {
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
        setIsLoading(false);
      } else if (!authLoading) {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isLoggedIn, authLoading, logout, router]);

  const handleInputChange = (field: keyof ImportFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTelegramDataChange = (field: keyof TelegramImportData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      telegramData: {
        ...prev.telegramData!,
        [field]: value
      }
    }));
  };

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files);
    
    if (files && files.length > 0) {
      const zipFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.zip'));
      if (zipFiles.length > 0) {
        const estimatedLessons = zipFiles.length * 5;
        const estimatedDuration = zipFiles.length * 90;
        
        handleInputChange('estimatedLessons', estimatedLessons);
        handleInputChange('estimatedDuration', estimatedDuration);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const simulateFolderScan = async () => {
    setIsScanningFolder(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate scanning
    
    // Mock file discovery
    const mockFiles = [
      'Module 1/Lesson 1.mp4',
      'Module 1/Lesson 2.mp4',
      'Module 1/attachments.pdf',
      'Module 2/Lesson 1.mp4',
      'Module 2/Lesson 2.mp4',
      'Module 2/quiz.pdf',
      'Module 3/Lesson 1.mp4'
    ];
    
    setFolderScanResults(mockFiles);
    setIsScanningFolder(false);
    
    handleInputChange('estimatedLessons', mockFiles.filter(f => f.endsWith('.mp4')).length);
  };

  const handleFolderPathChange = (path: string) => {
    handleInputChange('folderPath', path);
    if (path.trim()) {
      simulateFolderScan();
    } else {
      setFolderScanResults([]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setImportError(tCommon('requiredField'));
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      let result;

      switch (activeTab) {
        case 'upload':
          if (!selectedFiles || selectedFiles.length === 0) {
            throw new Error(tCommon('noFilesSelected'));
          }
          result = await CoursesAPI.uploadCourseFiles(formData, Array.from(selectedFiles));
          break;

        case 'url':
          if (!formData.sourceUrl?.trim()) {
            throw new Error(tCommon('sourceUrlRequired'));
          }
          result = await CoursesAPI.importCourseFromUrl(formData);
          break;

        case 'telegram':
          if (!formData.telegramData?.channelId?.trim()) {
            throw new Error(tCommon('channelIdRequired'));
          }
          result = await CoursesAPI.importFromTelegram(formData, formData.telegramData);
          break;

        case 'folder':
          if (!formData.folderPath?.trim()) {
            throw new Error(tCommon('folderPathRequired'));
          }
          result = await CoursesAPI.importFromFolder(formData, formData.folderPath, formData.createWeakLink || false);
          break;

        default:
          throw new Error(tCommon('invalidImportMethod'));
      }

      if (result.success) {
        setImportSuccess(true);
        setTimeout(() => {
          router.push('/cognitahz');
        }, 2000);
      } else {
        setImportError(result.error || tCommon('importFailed'));
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : tCommon('importFailed'));
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      platform: 'imported',
      difficulty: 'beginner',
      estimatedLessons: 1,
      estimatedDuration: 60,
      instructor: '',
      language: 'en',
      sourceUrl: '',
      folderPath: '',
      createWeakLink: true,
      requiresAuth: false,
      telegramData: {
        channelId: '',
        authMethod: 'bot',
        botToken: '',
        contentFormat: 'stream',
        messageRange: { start: undefined, end: undefined },
        filterKeywords: []
      }
    });
    setSelectedFiles(null);
    setFolderScanResults([]);
    setImportError(null);
    setImportSuccess(false);
  };

  if (isLoading || authLoading) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div className="content-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner">{tGeneral('loading')}</div>
          </div>
        </main>
      </div>
    );
  }

  if (importSuccess) {
    return (
      <div>
        <Header />
        <main className="main-content">
          <div className="import-container">
            <div className="import-success">
              <FontAwesomeIcon icon={faCheckCircle} size="3x" className="success-icon" />
              <h2>{tCommon('success')}</h2>
              <p>{t('redirecting')}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="main-content">
        <div className="import-container">
          <div className="import-header">
            <h1 className="import-title">{t('title')}</h1>
            <p className="import-subtitle">{t('subtitle')}</p>
          </div>

          {/* Tab Navigation */}
          <div className="import-tabs">
            <button 
              className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <FontAwesomeIcon icon={faUpload} />
              {t('tabs.upload')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => setActiveTab('url')}
            >
              <FontAwesomeIcon icon={faLink} />
              {t('tabs.url')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'telegram' ? 'active' : ''}`}
              onClick={() => setActiveTab('telegram')}
            >
              <FontAwesomeIcon icon={faComments} />
              {t('tabs.telegram')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'folder' ? 'active' : ''}`}
              onClick={() => setActiveTab('folder')}
            >
              <FontAwesomeIcon icon={faFolder} />
              {t('tabs.folder')}
            </button>
          </div>

          <div className="import-content">
            {/* Common Form Fields */}
            <div className="form-section">
              <h3>{t('courseInformation')}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">{tCommon('courseTitle')} *</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={tCommon('courseTitlePlaceholder')}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="instructor">{tCommon('instructor')}</label>
                  <input
                    id="instructor"
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                    placeholder={tCommon('instructorPlaceholder')}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">{tCommon('category')}</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="form-select"
                  >
                    <option value="programming">{t('categories.programming')}</option>
                    <option value="design">{t('categories.design')}</option>
                    <option value="business">{t('categories.business')}</option>
                    <option value="marketing">{t('categories.marketing')}</option>
                    <option value="photography">{t('categories.photography')}</option>
                    <option value="music">{t('categories.music')}</option>
                    <option value="language">{t('categories.language')}</option>
                    <option value="other">{t('categories.other')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty">{tCommon('difficulty')}</label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="form-select"
                  >
                    <option value="beginner">{t('difficulty.beginner')}</option>
                    <option value="intermediate">{t('difficulty.intermediate')}</option>
                    <option value="advanced">{t('difficulty.advanced')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedLessons">{tCommon('estimatedLessons')}</label>
                  <input
                    id="estimatedLessons"
                    type="number"
                    min="1"
                    value={formData.estimatedLessons}
                    onChange={(e) => handleInputChange('estimatedLessons', parseInt(e.target.value) || 1)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedDuration">{tCommon('estimatedDuration')}</label>
                  <input
                    id="estimatedDuration"
                    type="number"
                    min="1"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 60)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">{tCommon('description')}</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={tCommon('descriptionPlaceholder')}
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            {/* Tab-specific Content */}
            <div className="form-section">
              {activeTab === 'upload' && (
                <div className="upload-section">
                  <h3>{t('upload.title')}</h3>
                  <p className="section-description">{t('upload.description')}</p>
                  
                  <div className="upload-info-box">
                    <h4>{t('upload.moduleStructureTitle')}</h4>
                    <p>{t('upload.moduleStructureDesc')}</p>
                    <ul>
                      <li>{t('upload.structureExample1')}</li>
                      <li>{t('upload.structureExample2')}</li>
                      <li>{t('upload.structureExample3')}</li>
                    </ul>
                  </div>
                  
                  <div 
                    className={`file-drop-zone ${isDragOver ? 'drag-over' : ''} ${selectedFiles ? 'has-files' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" />
                    <p>{t('upload.dragDrop')}</p>
                    <small>{t('upload.supportedFormats')}</small>
                    <small>{t('upload.noSizeLimit')}</small>
                    
                    {selectedFiles && (
                      <div className="selected-files">
                        <p><strong>{t('upload.modulesSelected', { count: selectedFiles.length })}</strong></p>
                        <div className="modules-preview">
                          {Array.from(selectedFiles).map((file, index) => (
                            <div key={index} className="module-file">
                              <div className="module-info">
                                <span className="module-name">Module {index + 1}: {file.name.replace('.zip', '')}</span>
                                <span className="module-size">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                              </div>
                              {file.name.endsWith('.zip') && (
                                <small className="module-note">{t('upload.zipModuleNote')}</small>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".zip"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {activeTab === 'url' && (
                <div className="url-section">
                  <h3>{t('url.title')}</h3>
                  <p className="section-description">{t('url.description')}</p>
                  
                  <div className="url-info-box">
                    <h4>{t('url.backupNotice')}</h4>
                    <p>{t('url.backupNoticeDesc')}</p>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="sourceUrl">{t('url.sourceUrl')} *</label>
                    <input
                      id="sourceUrl"
                      type="url"
                      value={formData.sourceUrl}
                      onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                      placeholder={t('url.sourceUrlPlaceholder')}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.requiresAuth}
                        onChange={(e) => handleInputChange('requiresAuth', e.target.checked)}
                      />
                      <span>{t('url.requiresAuth')}</span>
                    </label>
                    <small className="info-text">{t('url.requiresAuthDesc')}</small>
                  </div>
                  
                  <small className="info-text">{t('url.supportedSources')}</small>
                </div>
              )}

              {activeTab === 'telegram' && (
                <div className="telegram-section">
                  <h3>{t('telegram.title')}</h3>
                  <p className="section-description">{t('telegram.description')}</p>
                  
                  <div className="form-group">
                    <label htmlFor="channelId">{t('telegram.channelId')} *</label>
                    <input
                      id="channelId"
                      type="text"
                      value={formData.telegramData?.channelId}
                      onChange={(e) => handleTelegramDataChange('channelId', e.target.value)}
                      placeholder={t('telegram.channelIdPlaceholder')}
                      className="form-input"
                    />
                    <small className="info-text">{t('telegram.channelIdHelp')}</small>
                  </div>

                  <div className="form-section">
                    <h4>{t('telegram.authMethodTitle')}</h4>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="authMethod"
                          checked={formData.telegramData?.authMethod === 'bot'}
                          onChange={() => handleTelegramDataChange('authMethod', 'bot')}
                        />
                        <span>{t('telegram.botAuth')}</span>
                        <small>{t('telegram.botAuthDesc')}</small>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="authMethod"
                          checked={formData.telegramData?.authMethod === 'telethon'}
                          onChange={() => handleTelegramDataChange('authMethod', 'telethon')}
                        />
                        <span>{t('telegram.telethonAuth')}</span>
                        <small>{t('telegram.telethonAuthDesc')}</small>
                      </label>
                    </div>
                  </div>

                  {formData.telegramData?.authMethod === 'bot' && (
                    <div className="form-group">
                      <label htmlFor="botToken">{t('telegram.botToken')} *</label>
                      <input
                        id="botToken"
                        type="text"
                        value={formData.telegramData?.botToken}
                        onChange={(e) => handleTelegramDataChange('botToken', e.target.value)}
                        placeholder={t('telegram.botTokenPlaceholder')}
                        className="form-input"
                      />
                    </div>
                  )}

                  <div className="form-section">
                    <h4>{t('telegram.contentFormatTitle')}</h4>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="contentFormat"
                          checked={formData.telegramData?.contentFormat === 'stream'}
                          onChange={() => handleTelegramDataChange('contentFormat', 'stream')}
                        />
                        <span>{t('telegram.streamFormat')}</span>
                        <small>{t('telegram.streamFormatDesc')}</small>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="contentFormat"
                          checked={formData.telegramData?.contentFormat === 'zip'}
                          onChange={() => handleTelegramDataChange('contentFormat', 'zip')}
                        />
                        <span>{t('telegram.zipFormat')}</span>
                        <small>{t('telegram.zipFormatDesc')}</small>
                      </label>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="startMessage">{t('telegram.startMessage')}</label>
                      <input
                        id="startMessage"
                        type="number"
                        value={formData.telegramData?.messageRange?.start || ''}
                        onChange={(e) => handleTelegramDataChange('messageRange', {
                          ...formData.telegramData?.messageRange,
                          start: parseInt(e.target.value) || undefined
                        })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="endMessage">{t('telegram.endMessage')}</label>
                      <input
                        id="endMessage"
                        type="number"
                        value={formData.telegramData?.messageRange?.end || ''}
                        onChange={(e) => handleTelegramDataChange('messageRange', {
                          ...formData.telegramData?.messageRange,
                          end: parseInt(e.target.value) || undefined
                        })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="filterKeywords">{t('telegram.filterKeywords')}</label>
                    <input
                      id="filterKeywords"
                      type="text"
                      value={formData.telegramData?.filterKeywords?.join(', ')}
                      onChange={(e) => handleTelegramDataChange('filterKeywords', 
                        e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      )}
                      placeholder={t('telegram.filterKeywordsPlaceholder')}
                      className="form-input"
                    />
                  </div>

                  <small className="info-text">{t('telegram.instructions')}</small>
                </div>
              )}

              {activeTab === 'folder' && (
                <div className="folder-section">
                  <h3>{t('folder.title')}</h3>
                  <p className="section-description">{t('folder.description')}</p>
                  
                  <div className="form-group">
                    <label htmlFor="folderPath">{t('folder.folderPath')} *</label>
                    <div className="folder-input-group">
                      <input
                        id="folderPath"
                        type="text"
                        value={formData.folderPath}
                        onChange={(e) => handleFolderPathChange(e.target.value)}
                        placeholder={t('folder.folderPathPlaceholder')}
                        className="form-input"
                      />
                      <button type="button" className="browse-button">
                        {t('folder.browse')}
                      </button>
                    </div>
                  </div>

                  <div className="link-type-group">
                    <h4>{t('folder.linkType')}</h4>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="linkType"
                          checked={formData.createWeakLink}
                          onChange={() => handleInputChange('createWeakLink', true)}
                        />
                        <span>{t('folder.weakLink')}</span>
                        <small>{t('folder.weakLinkDesc')}</small>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="linkType"
                          checked={!formData.createWeakLink}
                          onChange={() => handleInputChange('createWeakLink', false)}
                        />
                        <span>{t('folder.strongLink')}</span>
                        <small>{t('folder.strongLinkDesc')}</small>
                      </label>
                    </div>
                  </div>

                  {isScanningFolder && (
                    <div className="scanning-status">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>{t('folder.scanning')}</span>
                    </div>
                  )}

                  {folderScanResults.length > 0 && (
                    <div className="scan-results">
                      <h4>{t('folder.filesFound', { count: folderScanResults.length })}</h4>
                      <ul className="file-list">
                        {folderScanResults.slice(0, 10).map((file, index) => (
                          <li key={index}>{file}</li>
                        ))}
                        {folderScanResults.length > 10 && (
                          <li>{t('folder.moreFiles', { count: folderScanResults.length - 10 })}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {importError && (
              <div className="error-message">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{importError}</span>
                <button onClick={() => setImportError(null)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="import-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => router.push('/cognitahz')}
                disabled={isImporting}
              >
                {tCommon('cancel')}
              </button>
              <button 
                type="button" 
                className="reset-button"
                onClick={resetForm}
                disabled={isImporting}
              >
                {t('reset')}
              </button>
              <button 
                type="button" 
                className="import-button"
                onClick={handleSubmit}
                disabled={isImporting || !formData.title.trim()}
              >
                {isImporting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    {tCommon('importing')}
                  </>
                ) : (
                  tCommon('import')
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
