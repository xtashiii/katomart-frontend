'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faDownload, 
  faEye, 
  faSave,
  faVideo,
  faFileAlt,
  faStar,
  faBookmark,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from 'react';
import { DetailedCourse, Lesson } from '@/lib/coursesAPI';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '../styles/video-player.css';

const ClickableNote = ({ content, onContentChange, onTimestampClick, isEditing, setIsEditing, notesRef }: any) => {
  const t = useTranslations('course');

  const parseAndRenderContent = () => {
    const parts = content.split(/(\[\d{1,2}:\d{2}(?::\d{2})?\])/g);
    return parts.map((part: string, index: number) => {
      const match = part.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]$/);
      if (match) {
        const timeStr = match[1];
        const timeParts = timeStr.split(':').map(Number);
        let seconds = 0;
        if (timeParts.length === 3) {
          seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
        } else {
          seconds = timeParts[0] * 60 + timeParts[1];
        }
        return (
          <button 
            key={index} 
            className="timestamp-link" 
            onClick={() => onTimestampClick(seconds)}
          >
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (isEditing) {
    return (
      <textarea
        ref={notesRef}
        className="notes-textarea"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        placeholder={t('notesPlaceholder')}
        autoFocus
      />
    );
  }

  return (
    <div 
      className="notes-display" 
      onClick={() => setIsEditing(true)}
    >
      {parseAndRenderContent()}
    </div>
  );
};

interface VideoMarker {
  id: string;
  time: number;
  note: string;
  timestamp: Date;
}

interface ExtendedLesson extends Lesson {
  videoMarkers?: VideoMarker[];
  userRating?: number;
}

interface CourseContentProps {
  course: DetailedCourse;
  selectedLesson: ExtendedLesson | null;
  onNotesUpdate: (lessonId: string, notes: string) => void;
  onLessonComplete: (lessonId: string) => void;
  onLessonRate?: (lessonId: string, rating: number) => void;
  onMarkersUpdate?: (lessonId: string, markers: VideoMarker[]) => void;
}

export default function CourseContent({ 
  course, 
  selectedLesson, 
  onNotesUpdate, 
  onLessonComplete,
  onLessonRate,
  onMarkersUpdate
}: CourseContentProps) {
  const t = useTranslations('course');
  const [notes, setNotes] = useState(selectedLesson?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [videoMarkers, setVideoMarkers] = useState<VideoMarker[]>(selectedLesson?.videoMarkers || []);
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [markerNote, setMarkerNote] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNotes(selectedLesson?.notes || '');
    setVideoMarkers((selectedLesson as any)?.videoMarkers || []);
  }, [selectedLesson]);

  useEffect(() => {
    if (playerRef.current) {
      console.log('Disposing existing video player');
      playerRef.current.dispose();
      playerRef.current = null;
    }

    if (selectedLesson?.hasVideo && selectedLesson.videoUrl && videoRef.current) {
      const initializePlayer = () => {
        if (!videoRef.current) {
          console.log('Video element not found in DOM');
          return;
        }

        console.log('Initializing video player with URL:', selectedLesson.videoUrl);
        
        const videoOptions = {
          controls: true,
          responsive: true,
          fluid: true,
          preload: 'metadata',
          playbackRates: [0.5, 1, 1.25, 1.5, 2],
          aspectRatio: '16:9',
          techOrder: ['html5'],
          html5: {
            vhs: {
              overrideNative: true
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false
          }
        };

        try {
          const player = videojs(videoRef.current, videoOptions);
          playerRef.current = player;

          player.ready(() => {
            console.log('Player ready, setting source:', selectedLesson.videoUrl);
            player.src({
              src: selectedLesson.videoUrl,
              type: 'video/mp4'
            });
          });
          
          player.on('timeupdate', () => {
            const currentTime = player.currentTime();
            setCurrentVideoTime(currentTime || 0);
          });

          player.on('loadedmetadata', () => {
            console.log('Video metadata loaded');
            addMarkersToProgressBar(player);
          });

          player.on('error', (error: any) => {
            console.error('Video player error:', error);
          });

          player.on('loadstart', () => {
            console.log('Video load started');
          });

          player.on('canplay', () => {
            console.log('Video can play');
          });

        } catch (error) {
          console.error('Error initializing video player:', error);
        }
      };

      const timeoutId = setTimeout(initializePlayer, 100);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [selectedLesson?.id, selectedLesson?.videoUrl]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        console.log('Component unmounting, disposing video player');
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const handleAddTimestampToNotes = () => {
    if (!playerRef.current) return;

    const currentTime = playerRef.current.currentTime() || 0;
    const formattedTime = formatTime(currentTime);
    const timestampText = `[${formattedTime}]: `;

    setNotes(prevNotes => {
      if (prevNotes.trim().length > 0) {
        return `${prevNotes.trimEnd()}\n${timestampText}`;
      }
      return timestampText;
    });

    if (notesRef.current) {
      notesRef.current.focus();
      setTimeout(() => {
          if (notesRef.current) {
              const endPosition = notesRef.current.value.length;
              notesRef.current.setSelectionRange(endPosition, endPosition);
              notesRef.current.scrollTop = notesRef.current.scrollHeight;
          }
      }, 0);
    }
  };

  const addMarkersToProgressBar = (player: any) => {
    const progressControl = player.controlBar.progressControl;
    const seekBar = progressControl.seekBar;
    
    const existingMarkers = seekBar.el().querySelectorAll('.vjs-marker');
    existingMarkers.forEach((marker: HTMLElement) => marker.remove());

    videoMarkers.forEach((marker) => {
      const duration = player.duration();
      if (duration > 0) {
        const position = (marker.time / duration) * 100;
        const markerEl = document.createElement('div');
        markerEl.className = 'vjs-marker';
        markerEl.style.position = 'absolute';
        markerEl.style.left = `${position}%`;
        markerEl.style.width = '3px';
        markerEl.style.height = '100%';
        markerEl.style.backgroundColor = '#ff6b35';
        markerEl.style.cursor = 'pointer';
        markerEl.style.zIndex = '1';
        markerEl.title = marker.note;
        
        markerEl.addEventListener('click', (e) => {
          e.stopPropagation();
          player.currentTime(marker.time);
        });
        
        seekBar.el().appendChild(markerEl);
      }
    });
  };

  const handleSaveNotes = async () => {
    if (!selectedLesson) return;
    
    setIsSavingNotes(true);
    try {
      await onNotesUpdate(selectedLesson.id, notes);
      if (onMarkersUpdate) {
        await onMarkersUpdate(selectedLesson.id, videoMarkers);
      }
      setTimeout(() => setIsSavingNotes(false), 500);
    } catch (err) {
      console.error('Failed to save notes:', err);
      setIsSavingNotes(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedLesson || selectedLesson.completed) return;
    
    try {
      await onLessonComplete(selectedLesson.id);
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    }
  };

  const handleRatingClick = (rating: number) => {
    if (!selectedLesson || !onLessonRate) return;
    onLessonRate(selectedLesson.id, rating);
  };

  const handleAddMarker = () => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.currentTime();
    setCurrentVideoTime(currentTime || 0);
    setShowMarkerDialog(true);
  };

  const handleSaveMarker = () => {
    if (!markerNote.trim() || !selectedLesson) return;
    
    const newMarker: VideoMarker = {
      id: Date.now().toString(),
      time: currentVideoTime,
      note: markerNote.trim(),
      timestamp: new Date()
    };
    
    const updatedMarkers = [...videoMarkers, newMarker].sort((a, b) => a.time - b.time);
    setVideoMarkers(updatedMarkers);
    setMarkerNote('');
    setShowMarkerDialog(false);
    
    if (playerRef.current) {
      setTimeout(() => addMarkersToProgressBar(playerRef.current), 100);
    }
  };

  const handleDeleteMarker = (markerId: string) => {
    const updatedMarkers = videoMarkers.filter(marker => marker.id !== markerId);
    setVideoMarkers(updatedMarkers);
    
    if (playerRef.current) {
      setTimeout(() => addMarkersToProgressBar(playerRef.current), 100);
    }
  };

  const handleJumpToMarker = (time: number) => {
    if (playerRef.current) {

      playerRef.current.currentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAttachmentAction = (attachment: any) => {
    if (attachment.type === 'pdf') {
      setPdfUrl(attachment.url);
    } else {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderRatingStars = () => {
    const currentRating = selectedLesson?.userRating || 0;
    const displayRating = hoveredRating || currentRating;

    return (
      <div className="lesson-rating-component">
        <span className="rating-label">{t('rateLesson')}:</span>
        <div 
          className="rating-stars"
          onMouseLeave={() => setHoveredRating(0)}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={`rating-star ${i < displayRating ? 'filled' : 'empty'} ${hoveredRating > 0 ? 'interactive' : ''}`}
              onMouseEnter={() => setHoveredRating(i + 1)}
              onClick={() => handleRatingClick(i + 1)}
            />
          ))}
        </div>
        {currentRating > 0 && (
          <span className="rating-text">
            {currentRating}/5 {t('stars')}
          </span>
        )}
      </div>
    );
  };

  if (!selectedLesson) {
    return (
      <div className="course-content">
        <div className="content-placeholder">
          <h2>Welcome to {course.title}</h2>
          <p>Select a lesson from the sidebar to begin learning.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-content">
      <div className="content-body">
        <div className="main-content-area">
          {/* Video Section with Video.js */}
          {selectedLesson.hasVideo && selectedLesson.videoUrl && (
            <div className="video-section">
              <div className="video-container">
                {/* Video.js Player */}
                <video
                  ref={videoRef}
                  className="video-js vjs-default-skin"
                  preload="none"
                  controls={false}
                  playsInline
                >
                  <p className="vjs-no-js">
                    To view this video please enable JavaScript, and consider upgrading to a web browser that
                    <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noopener noreferrer">
                      supports HTML5 video
                    </a>.
                  </p>
                </video>
              </div>
            </div>
          )}

          {/* Lesson Info Box */}
          <div className="lesson-info-box">
            <div className="lesson-header">
              <div className="lesson-header-left">
                <h1 className="lesson-title">{selectedLesson.name}</h1>
                <div className="lesson-meta">
                  {selectedLesson.duration && (
                    <span className="lesson-duration">
                      {t('duration', { minutes: selectedLesson.duration })}
                    </span>
                  )}
                  {selectedLesson.completed && (
                    <span className="lesson-status completed">
                      <FontAwesomeIcon icon={faCheck} />
                      {t('lessonCompleted')}
                    </span>
                  )}
                  {!selectedLesson.completed && (
                    <button 
                      className="complete-button"
                      onClick={handleMarkComplete}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      {t('markCompleted')}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="lesson-header-right">
                {renderRatingStars()}
              </div>
            </div>
            
            {selectedLesson.description && (
              <div className="lesson-description-box">
                {selectedLesson.description}
              </div>
            )}
          </div>

          {/* Video Markers Section */}
          {videoMarkers.length > 0 && (
            <div className="markers-section">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faBookmark} />
                {t('videoMarkers')}
              </h3>
              <div className="markers-list">
                {videoMarkers.map((marker) => (
                  <div key={marker.id} className="marker-item">
                    <div className="marker-time">
                      <button 
                        className="time-link"
                        onClick={() => handleJumpToMarker(marker.time)}
                      >
                        {formatTime(marker.time)}
                      </button>
                    </div>
                    <div className="marker-note">{marker.note}</div>
                    <button 
                      className="delete-marker"
                      onClick={() => handleDeleteMarker(marker.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {selectedLesson.hasAttachments && selectedLesson.attachments.length > 0 && (
            <div className="attachments-section">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faFileAlt} />
                {t('attachments')}
              </h3>
              <div className="attachments-list">
                {selectedLesson.attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment-item">
                    <div className="attachment-info">
                      <div className="attachment-name">{attachment.name}</div>
                      <div className="attachment-meta">
                        <span className="attachment-type">{attachment.type.toUpperCase()}</span>
                        <span className="attachment-size">{formatFileSize(attachment.size)}</span>
                      </div>
                    </div>
                    <button
                      className={`attachment-action ${attachment.type === 'pdf' ? 'view' : 'download'}`}
                      onClick={() => handleAttachmentAction(attachment)}
                    >
                      <FontAwesomeIcon icon={attachment.type === 'pdf' ? faEye : faDownload} />
                      {attachment.type === 'pdf' ? t('viewPdf') : t('downloadAttachment')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF Viewer Modal */}
          {pdfUrl && (
            <div className="pdf-modal-overlay" onClick={() => setPdfUrl(null)}>
              <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pdf-header">
                  <button 
                    className="close-pdf"
                    onClick={() => setPdfUrl(null)}
                  >
                    ×
                  </button>
                </div>
                <iframe
                  className="pdf-viewer"
                  src={pdfUrl}
                  title="PDF Viewer"
                />
              </div>
            </div>
          )}

          {/* Marker Dialog */}
          {showMarkerDialog && (
            <div className="marker-dialog-overlay" onClick={() => setShowMarkerDialog(false)}>
              <div className="marker-dialog" onClick={(e) => e.stopPropagation()}>
                <h3>{t('addVideoMarker')}</h3>
                <p>{t('markerTime')}: {formatTime(currentVideoTime)}</p>
                <textarea
                  className="marker-note-input"
                  value={markerNote}
                  onChange={(e) => setMarkerNote(e.target.value)}
                  placeholder={t('markerNotePlaceholder')}
                  rows={3}
                  autoFocus
                />
                <div className="marker-dialog-actions">
                  <button 
                    className="cancel-marker"
                    onClick={() => setShowMarkerDialog(false)}
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    className="save-marker"
                    onClick={handleSaveMarker}
                    disabled={!markerNote.trim()}
                  >
                    {t('saveMarker')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="notes-section">
          <div className="notes-container">
            <div className="notes-header">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faSave} />
                {t('notes')}
              </h3>
            </div>
            {selectedLesson.hasVideo && (
              <button 
                className="add-timestamp-button" 
                onClick={handleAddTimestampToNotes}
                title={t('createVideoNote')}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>{t('createVideoNote')}</span>
              </button>
            )}
            <ClickableNote
              content={notes}
              onContentChange={setNotes}
              onTimestampClick={handleJumpToMarker}
              isEditing={isEditingNotes}
              setIsEditing={setIsEditingNotes}
              notesRef={notesRef}
            />
            <button
              className={`save-notes-button ${isSavingNotes ? 'saving' : ''}`}
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
            >
              <FontAwesomeIcon icon={faSave} />
              {isSavingNotes ? t('notesSaved') : t('saveNotes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
