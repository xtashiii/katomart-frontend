'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faDownload,
  faEye,
  faSave,
  faFileAlt,
  faStar,
  faBookmark,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { DetailedCourse, Lesson } from '@/app/api/courses/types';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '../styles/video-player.css';

// Define a type for the video.js player instance
interface VideoJSPlayer {
  currentTime(): number;
  currentTime(time: number): void;
  duration?(): number;
  src?(source: { src: string; type: string }): void;
  ready?(callback: () => void): void;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  off?(type?: string | string[], fn?: (...args: unknown[]) => void): void;
  dispose?(): void;
  pause?(): void;
  userActive?(active?: boolean): boolean;
  clearTimeout?(): void;
  controlBar?: {
    progressControl?: {
      seekBar?: {
        el(): HTMLElement | null;
      };
    };
    playbackRateMenuButton?: {
      show(): void;
    };
  };
  tech_?: {
    el_?: HTMLElement;
  };
  el?(): HTMLElement | null;
}

interface ClickableNoteProps {
  content: string;
  onContentChange: (content: string) => void;
  onTimestampClick: (timestamp: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  notesRef: React.RefObject<HTMLTextAreaElement | null>;
}

const ClickableNote = ({
  content,
  onContentChange,
  onTimestampClick,
  isEditing,
  setIsEditing,
  notesRef,
}: ClickableNoteProps) => {
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
            onClick={() => onTimestampClick(seconds.toString())}
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
    <div className="notes-display" onClick={() => setIsEditing(true)}>
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
  onMarkersUpdate,
}: CourseContentProps) {
  const t = useTranslations('course');
  const [notes, setNotes] = useState(selectedLesson?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [videoMarkers, setVideoMarkers] = useState<VideoMarker[]>(
    selectedLesson?.videoMarkers || []
  );
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [markerNote, setMarkerNote] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VideoJSPlayer | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const isComponentMountedRef = useRef(true);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerInstanceId = useRef<string>('');

  const addMarkersToProgressBar = useCallback(
    (player: VideoJSPlayer) => {
      try {
        // Check if component is still mounted
        if (!isComponentMountedRef.current) {
          return;
        }

        if (
          !player ||
          !player.controlBar ||
          !player.controlBar?.progressControl
        ) {
          console.warn('Player or progress control not available for markers');
          return;
        }

        const progressControl = player.controlBar?.progressControl;
        const seekBar = progressControl?.seekBar;

        if (!seekBar || !seekBar?.el()) {
          console.warn('Seek bar element not available for markers');
          return;
        }

        // Safely remove existing markers
        const seekBarEl = seekBar?.el();
        if (
          seekBarEl &&
          document.body.contains(seekBarEl) &&
          isComponentMountedRef.current
        ) {
          const existingMarkers = seekBarEl.querySelectorAll('.vjs-marker');
          existingMarkers.forEach((marker) => {
            try {
              if (marker.parentNode && isComponentMountedRef.current) {
                marker.parentNode.removeChild(marker);
              }
            } catch (error) {
              console.warn('Error removing existing marker:', error);
            }
          });

          videoMarkers.forEach((marker) => {
            if (!isComponentMountedRef.current) {
              return;
            }

            const duration = player.duration?.();
            if (duration && duration > 0) {
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
                if (
                  isComponentMountedRef.current &&
                  playerRef.current === (player as unknown as VideoJSPlayer)
                ) {
                  player.currentTime(marker.time);
                }
              });

              // Safely append marker
              try {
                if (
                  seekBarEl &&
                  document.body.contains(seekBarEl) &&
                  isComponentMountedRef.current
                ) {
                  seekBarEl.appendChild(markerEl);
                }
              } catch (error) {
                console.warn('Error appending marker:', error);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error adding markers to progress bar:', error);
      }
    },
    [videoMarkers]
  );

  useEffect(() => {
    setNotes(selectedLesson?.notes || '');
    setVideoMarkers(
      (selectedLesson as Lesson & { videoMarkers?: VideoMarker[] })
        ?.videoMarkers || []
    );
  }, [selectedLesson]);

  useEffect(() => {
    // Set component as mounted and generate unique instance ID
    isComponentMountedRef.current = true;
    playerInstanceId.current = `player-${selectedLesson?.id || 'none'}-${Date.now()}`;

    // Clear any pending initialization
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current);
      initializationTimeoutRef.current = null;
    }

    // Completely destroy and recreate the video container to avoid DOM conflicts
    const cleanupAndRecreateContainer = () => {
      if (playerRef.current) {
        try {
          console.log('Disposing existing video player');
          const player = playerRef.current;

          // More aggressive cleanup to stop all internal processes
          try {
            // Stop any playing media
            if (typeof player.pause === 'function') {
              player.pause?.();
            }

            // Clear any pending timeouts/intervals in video.js
            if (player.tech_ && player.tech_.el_) {
              // Clear any tech-level event listeners
              const techEl = player.tech_.el_;
              if (techEl && typeof techEl.removeEventListener === 'function') {
                // Remove common event listeners that might cause issues
                [
                  'loadstart',
                  'loadedmetadata',
                  'canplay',
                  'timeupdate',
                  'ended',
                ].forEach((event) => {
                  try {
                    techEl.removeEventListener(event, () => {});
                  } catch {
                    // Ignore errors
                  }
                });
              }
            }

            // Remove all event listeners
            player.off?.();

            // Stop user activity tracking that causes the DOM errors
            if (player.userActive) {
              try {
                player.userActive?.(false);
              } catch {
                // Ignore errors
              }
            }

            // Clear any timers
            if (player.clearTimeout) {
              player.clearTimeout?.();
            }

            // Try to dispose safely
            player.dispose?.();

            // Force a small delay to let disposal complete
            setTimeout(() => {
              // This helps ensure all internal cleanup is complete
            }, 10);
          } catch (error) {
            console.warn(
              'Player disposal failed, continuing with cleanup:',
              error
            );
          }
        } catch (error) {
          console.warn('Error during player cleanup:', error);
        } finally {
          playerRef.current = null;
        }
      }

      // Recreate the video container completely
      if (videoContainerRef.current && isComponentMountedRef.current) {
        // Clear the container
        videoContainerRef.current.innerHTML = '';

        // Create a new video element with proper attributes
        const videoElement = document.createElement('video');
        videoElement.className = 'video-js vjs-default-skin';
        videoElement.setAttribute('preload', 'none');
        videoElement.setAttribute('controls', 'false');
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('data-setup', '{}');
        videoElement.id = playerInstanceId.current;

        // Add the "no JavaScript" fallback content
        const noJsMessage = document.createElement('p');
        noJsMessage.className = 'vjs-no-js';
        noJsMessage.innerHTML =
          'To view this video please enable JavaScript, and consider upgrading to a web browser that <a href=\"https://videojs.com/html5-video-support/\" target=\"_blank\" rel=\"noopener noreferrer\">supports HTML5 video</a>.';
        videoElement.appendChild(noJsMessage);

        // Append to container and ensure it's properly attached
        videoContainerRef.current.appendChild(videoElement);

        // Force a reflow to ensure the element is fully attached
        void videoElement.offsetHeight;

        // Double-check the element is properly attached
        if (!document.body.contains(videoElement) || !videoElement.parentNode) {
          console.error('Video element failed to attach to DOM properly');
          return null;
        }

        return videoElement;
      }
      return null;
    };

    if (
      selectedLesson?.hasVideo &&
      selectedLesson.videoUrl &&
      isComponentMountedRef.current
    ) {
      const initializePlayer = () => {
        // Check if component is still mounted
        if (!isComponentMountedRef.current) {
          console.log('Component unmounted, skipping player initialization');
          return false;
        }

        const videoElement = cleanupAndRecreateContainer();
        if (!videoElement) {
          console.log('Failed to create video element, retrying...');
          return false;
        }

        console.log(
          'Initializing video player with URL:',
          selectedLesson.videoUrl
        );

        const videoOptions = {
          controls: true,
          responsive: true,
          fluid: false,
          fill: true,
          preload: 'metadata',
          playbackRates: [0.5, 1, 1.25, 1.5, 2],
          aspectRatio: '16:9',
          techOrder: ['html5'],
          html5: {
            vhs: {
              overrideNative: true,
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false,
          },
          userActions: {
            hotkeys: true,
          },
        };

        try {
          // Wait a bit for DOM to settle and ensure element is ready
          setTimeout(() => {
            if (!isComponentMountedRef.current) return;

            // Validate that the video element is properly attached and ready
            if (
              !videoElement ||
              !videoElement.parentNode ||
              !document.body.contains(videoElement)
            ) {
              console.warn(
                'Video element not properly attached to DOM, skipping initialization'
              );
              return;
            }

            // Additional check that the element is a valid video element
            if (videoElement.tagName !== 'VIDEO') {
              console.warn(
                'Element is not a video element, skipping initialization'
              );
              return;
            }

            try {
              console.log('Initializing video.js with validated element');
              const player = videojs(videoElement, videoOptions);

              // Check component is still mounted before setting ref
              if (!isComponentMountedRef.current) {
                try {
                  player.dispose?.();
                } catch {
                  // Ignore disposal errors
                }
                return;
              }

              playerRef.current = player as unknown as VideoJSPlayer;

              player.ready?.(() => {
                if (
                  !isComponentMountedRef.current ||
                  playerRef.current !== (player as unknown as VideoJSPlayer)
                ) {
                  return;
                }

                console.log(
                  'Player ready, setting source:',
                  selectedLesson.videoUrl
                );
                player.src?.({
                  src: selectedLesson.videoUrl,
                  type: 'video/mp4',
                });

                // Force playback rate menu to show
                try {
                  const playerTyped = player as unknown as VideoJSPlayer;
                  const playbackRateButton =
                    playerTyped.controlBar?.playbackRateMenuButton;
                  if (playbackRateButton) {
                    playbackRateButton.show();
                  }
                } catch {
                  // Ignore playback rate button errors
                }
              });

              player.on?.('timeupdate', () => {
                if (
                  isComponentMountedRef.current &&
                  playerRef.current === (player as unknown as VideoJSPlayer)
                ) {
                  const currentTime = player.currentTime();
                  setCurrentVideoTime(currentTime || 0);
                }
              });

              player.on?.('loadedmetadata', () => {
                if (
                  isComponentMountedRef.current &&
                  playerRef.current === (player as unknown as VideoJSPlayer)
                ) {
                  console.log('Video metadata loaded');
                  addMarkersToProgressBar(player as unknown as VideoJSPlayer);
                }
              });

              player.on?.('error', (error: unknown) => {
                console.error('Video player error:', error);
              });

              player.on?.('loadstart', () => {
                console.log('Video load started');
              });

              player.on?.('canplay', () => {
                console.log('Video can play');
              });
            } catch (error) {
              console.error('Error initializing video player:', error);
            }
          }, 150); // Increased timeout to ensure DOM is fully ready

          return true;
        } catch (error) {
          console.error('Error setting up video player:', error);
          return false;
        }
      };

      // Initialize player with retry mechanism
      let attempts = 0;
      const maxAttempts = 3;

      const tryInitialize = () => {
        if (!isComponentMountedRef.current) {
          return;
        }

        attempts++;
        const success = initializePlayer();

        if (
          !success &&
          attempts < maxAttempts &&
          isComponentMountedRef.current
        ) {
          console.log(
            `Player initialization attempt ${attempts} failed, retrying...`
          );
          initializationTimeoutRef.current = setTimeout(
            tryInitialize,
            attempts * 200
          );
        }
      };

      // Increased delay to ensure previous player is completely cleaned up
      initializationTimeoutRef.current = setTimeout(tryInitialize, 300);

      return () => {
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
          initializationTimeoutRef.current = null;
        }
      };
    } else {
      // Clean up when no video
      cleanupAndRecreateContainer();
    }
  }, [
    selectedLesson?.id,
    selectedLesson?.videoUrl,
    selectedLesson?.hasVideo,
    addMarkersToProgressBar,
  ]);

  useEffect(() => {
    return () => {
      console.log('Component unmounting, disposing video player');

      // Mark component as unmounted FIRST
      isComponentMountedRef.current = false;

      // Clear any pending initialization
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
        initializationTimeoutRef.current = null;
      }

      // Clean up player with aggressive cleanup
      if (playerRef.current) {
        try {
          const player = playerRef.current;

          // Stop user activity tracking immediately
          if (player.userActive) {
            try {
              player.userActive?.(false);
            } catch {
              // Ignore errors
            }
          }

          // Clear any internal timers
          if (player.clearTimeout) {
            try {
              player.clearTimeout?.();
            } catch {
              // Ignore errors
            }
          }

          // Remove all event listeners
          if (typeof player.off === 'function') {
            player.off?.();
          }

          // Pause the video
          if (typeof player.pause === 'function') {
            try {
              player.pause?.();
            } catch {
              // Ignore pause errors
            }
          }

          // Clear tech-level event listeners if possible
          if (player.tech_ && player.tech_.el_) {
            const techEl = player.tech_.el_;
            if (techEl && typeof techEl.removeEventListener === 'function') {
              [
                'loadstart',
                'loadedmetadata',
                'canplay',
                'timeupdate',
                'ended',
              ].forEach((event) => {
                try {
                  techEl.removeEventListener(event, () => {});
                } catch {
                  // Ignore errors
                }
              });
            }
          }

          // Try to dispose, but don't worry if it fails
          if (typeof player.dispose === 'function') {
            try {
              player.dispose?.();
            } catch {
              console.log(
                'Player element not in DOM, cleaning up references only'
              );
            }
          }
        } catch (error) {
          console.warn('Error disposing video player on unmount:', error);
        } finally {
          playerRef.current = null;
        }
      }
    };
  }, []);

  const handleAddTimestampToNotes = () => {
    if (!playerRef.current || !isComponentMountedRef.current) return;

    const currentTime = playerRef.current.currentTime() || 0;
    const formattedTime = formatTime(currentTime);
    const timestampText = `[${formattedTime}]: `;

    setNotes((prevNotes) => {
      if (prevNotes.trim().length > 0) {
        return `${prevNotes.trimEnd()}\n${timestampText}`;
      }
      return timestampText;
    });

    if (notesRef.current && isComponentMountedRef.current) {
      notesRef.current.focus();
      setTimeout(() => {
        if (notesRef.current && isComponentMountedRef.current) {
          const endPosition = notesRef.current.value.length;
          notesRef.current.setSelectionRange(endPosition, endPosition);
          notesRef.current.scrollTop = notesRef.current.scrollHeight;
        }
      }, 0);
    }
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

  // const handleAddMarker = () => {
  //   if (!playerRef.current || !isComponentMountedRef.current) return;
  //   const currentTime = playerRef.current.currentTime();
  //   setCurrentVideoTime(currentTime || 0);
  //   setShowMarkerDialog(true);
  // };

  const handleSaveMarker = () => {
    if (!markerNote.trim() || !selectedLesson) return;

    const newMarker: VideoMarker = {
      id: Date.now().toString(),
      time: currentVideoTime,
      note: markerNote.trim(),
      timestamp: new Date(),
    };

    const updatedMarkers = [...videoMarkers, newMarker].sort(
      (a, b) => a.time - b.time
    );
    setVideoMarkers(updatedMarkers);
    setMarkerNote('');
    setShowMarkerDialog(false);

    if (
      playerRef.current &&
      playerRef.current.el?.() &&
      document.body.contains(playerRef.current.el?.()) &&
      isComponentMountedRef.current
    ) {
      setTimeout(() => {
        if (playerRef.current && isComponentMountedRef.current) {
          addMarkersToProgressBar(playerRef.current);
        }
      }, 100);
    }
  };

  const handleDeleteMarker = (markerId: string) => {
    const updatedMarkers = videoMarkers.filter(
      (marker) => marker.id !== markerId
    );
    setVideoMarkers(updatedMarkers);

    if (
      playerRef.current &&
      playerRef.current.el?.() &&
      document.body.contains(playerRef.current.el?.()) &&
      isComponentMountedRef.current
    ) {
      setTimeout(() => {
        if (playerRef.current && isComponentMountedRef.current) {
          addMarkersToProgressBar(playerRef.current);
        }
      }, 100);
    }
  };

  const handleJumpToMarker = (time: number) => {
    if (playerRef.current && isComponentMountedRef.current) {
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

  const handleAttachmentAction = (attachment: {
    name: string;
    url: string;
    type: string;
  }) => {
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
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const renderRatingStars = () => {
    const currentRating = selectedLesson?.userRating || 0;
    const displayRating = hoveredRating || currentRating;

    return (
      <div className="lesson-rating-component">
        <span className="rating-label">{t('rateLesson')}:</span>
        <div className="rating-stars" onMouseLeave={() => setHoveredRating(0)}>
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
                {/* Video.js Player Container */}
                <div
                  ref={videoContainerRef}
                  className="video-js-container"
                  key={`video-container-${selectedLesson?.id}`}
                >
                  {/* Video element will be created dynamically */}
                </div>
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

              <div className="lesson-header-right">{renderRatingStars()}</div>
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
          {selectedLesson.hasAttachments &&
            selectedLesson.attachments.length > 0 && (
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
                          <span className="attachment-type">
                            {attachment.type.toUpperCase()}
                          </span>
                          <span className="attachment-size">
                            {formatFileSize(attachment.size)}
                          </span>
                        </div>
                      </div>
                      <button
                        className={`attachment-action ${attachment.type === 'pdf' ? 'view' : 'download'}`}
                        onClick={() => handleAttachmentAction(attachment)}
                      >
                        <FontAwesomeIcon
                          icon={attachment.type === 'pdf' ? faEye : faDownload}
                        />
                        {attachment.type === 'pdf'
                          ? t('viewPdf')
                          : t('downloadAttachment')}
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
                  <button className="close-pdf" onClick={() => setPdfUrl(null)}>
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
            <div
              className="marker-dialog-overlay"
              onClick={() => setShowMarkerDialog(false)}
            >
              <div
                className="marker-dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>{t('addVideoMarker')}</h3>
                <p>
                  {t('markerTime')}: {formatTime(currentVideoTime)}
                </p>
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
              onTimestampClick={(timestamp: string) =>
                handleJumpToMarker(Number(timestamp))
              }
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
