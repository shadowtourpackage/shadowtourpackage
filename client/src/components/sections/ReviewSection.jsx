import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';

import '../../styles/ReviewSection.css';
import reviewGallery from '../../data/reviewGallery.js';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to extract 11-char ID from YouTube URLs, Shorts URLs, or raw IDs
function getYouTubeId(urlOrId) {
  if (!urlOrId) return '';
  const match = String(urlOrId).match(
    /(?:shorts\/|youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)?([\w-]{11})/
  );
  return match ? match[1] : urlOrId;
}

/* =====================================================
   CUSTOM YOUTUBE PLAYER COMPONENT
   Hides all YouTube controls except custom Play/Pause
===================================================== */
function YouTubePlayer({ videoId, title }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Ensure YouTube Iframe API script is loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    let playerInstance = null;

    const initPlayer = () => {
      if (!containerRef.current || !window.YT || !window.YT.Player) return;

      playerInstance = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          controls: 0,        // Removes progress bar, volume, full screen, cog
          modestbranding: 1,  // Reduces YouTube branding
          rel: 0,             // Prevents related videos at the end
          showinfo: 0,
          iv_load_policy: 3,  // Disables pop-up annotations
          disablekb: 1,       // Disables keyboard shortcuts
          fs: 0,              // Disables full screen button
        },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event) => {
            // 1 = Playing, 2 = Paused, 0 = Ended
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          },
        },
      });

      playerRef.current = playerInstance;
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  return (
    <div className="custom-yt-container">
      <div ref={containerRef} className="yt-frame" />

      {/* Full-frame click overlay with Play / Pause button */}
      <button
        type="button"
        className={`yt-play-toggle-overlay ${isPlaying ? 'is-playing' : ''}`}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
      >
        <span className="yt-control-btn">
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x" />}
        </span>
      </button>
    </div>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */
export default function ReviewSection() {
  const [reviews, setReviews] = useState(reviewGallery);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD DYNAMIC REVIEWS FROM API
  ===================================================== */
  const loadReviews = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reviews`);

      if (!response.ok) {
        throw new Error('Failed to load reviews');
      }

      const result = await response.json();

      if (result && Array.isArray(result.data) && result.data.length > 0) {
        setReviews([...result.data, ...reviewGallery]);
        setCurrent(0);
      } else {
        setReviews(reviewGallery);
        setCurrent(0);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews(reviewGallery);
      setCurrent(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  /* =====================================================
     NAVIGATION HANDLERS (Manual Only)
  ===================================================== */
  const nextReview = () => {
    setCurrent((prev) => (prev + 1) % reviews.length);
  };

  const previousReview = () => {
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToReview = (index) => {
    setCurrent(index);
  };

  const review = reviews[current] || reviews[0];

  if (!review) return null;

  // Determine layout format
  const isShort =
    review.isShort ||
    review.type === 'short' ||
    review.youtubeUrl?.includes('/shorts/') ||
    review.youtubeId?.includes('/shorts/');

  const isWritten = !review.type || review.type === 'written';

  const cardLayoutClass = isShort
    ? 'card-layout-short'
    : isWritten
    ? 'card-layout-square'
    : 'card-layout-standard';

  const ytId = getYouTubeId(review.youtubeId || review.youtubeUrl);

  return (
    <section id="reviews" className="reviews-section">
      <div className="reviews-container">

        {/* HEADING */}
        <div className="reviews-heading reveal">
          <span>CUSTOMER EXPERIENCES</span>
          <h2 className="reveal">What Our Travellers Say</h2>
          <p className="reveal">
            Real experiences from people who travelled with Shadow Tour Packages.
          </p>
        </div>

        {/* REVIEW VIEWER WITH ARROWS */}
        <div className="reviews-viewer reveal">

          {/* LEFT ARROW */}
          {reviews.length > 1 && (
            <button
              type="button"
              className="review-arrow review-arrow-left"
              onClick={previousReview}
              aria-label="Previous review"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* CARD WRAPPER */}
          <div className={`review-card-wrapper ${cardLayoutClass}`}>
            <div className="review-card reveal">

              {/* ========== YOUTUBE VIDEO / SHORTS ========== */}
              {review.type === 'youtube' || review.type === 'short' || ytId ? (
                <div className={`review-video-container ${isShort ? 'is-short' : ''}`}>
                  <div className="youtube-embed-wrapper">
                    <YouTubePlayer
                      key={ytId || review._id}
                      videoId={ytId}
                      title={`${review.name || 'Customer'} - ${review.destination || 'Tour'}`}
                    />
                  </div>

                  <div className="video-label">
                    <Play size={15} />
                    <span>{isShort ? 'Short Review' : 'Video Review'}</span>
                  </div>
                </div>
              ) : review.type === 'video' ? (
                /* ========== NORMAL HTML5 VIDEO FILE ========== */
                <div className="review-video-container">
                  <video
                    className="review-video"
                    src={review.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                  />
                  <div className="video-label">
                    <Play size={15} />
                    <span>Video Review</span>
                  </div>
                </div>
              ) : (
                /* ========== WRITTEN REVIEW ========== */
                <div className="written-review">
                  <div className="quote-mark">“</div>
                  <p className="review-text">{review.review}</p>
                </div>
              )}

              {/* CUSTOMER INFO + RATING */}
              <div className="review-info">
                <div className="review-person">
                  <div className="review-avatar">
                    {review.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h3>{review.name || 'Customer'}</h3>
                    <p>{review.destination || 'Tour'}</p>
                  </div>
                </div>

                <div className="review-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={
                        star <= Number(review.rating || 5)
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT ARROW */}
          {reviews.length > 1 && (
            <button
              type="button"
              className="review-arrow review-arrow-right"
              onClick={nextReview}
              aria-label="Next review"
            >
              <ChevronRight size={22} />
            </button>
          )}

        </div>

        {/* PAGINATION DOTS */}
        {reviews.length > 1 && (
          <div className="review-dots">
            {reviews.map((item, index) => (
              <button
                type="button"
                key={item._id || index}
                className={index === current ? 'review-dot active' : 'review-dot'}
                onClick={() => goToReview(index)}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        )}

        {loading && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '16px',
              fontSize: '13px',
              color: '#94a3b8',
            }}
          >
            Loading latest reviews...
          </div>
        )}
      </div>
    </section>
  );
}