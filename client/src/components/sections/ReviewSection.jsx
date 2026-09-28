import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';

import '../../styles/ReviewSection.css';
import  reviewGallery  from '../../data/reviewGallery.js';

const INSTAGRAM_HIGHLIGHTS_URL =
  'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDUzMzQwMDQ0NDQxMjQ0?story_media_id=3820831953520844477_78515209510&stkn=bTB0cXI0a3k0dTh5';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* =====================================================
   COMPONENT
===================================================== */

export default function ReviewSection() {
  /*
   * Reviews contain:
   *
   * 1. Dynamic reviews from backend
   * 2. 6 static video reviews from reviewGallery.js
   *
   * Static videos are always placed at the end.
   */

  const [reviews, setReviews] = useState(reviewGallery);

  const [current, setCurrent] = useState(0);

  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  /* =====================================================
     LOAD REVIEWS FROM BACKEND
  ===================================================== */

  const loadReviews = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reviews`);

      if (!response.ok) {
        throw new Error('Failed to load reviews');
      }

      const result = await response.json();

      /*
       * If backend contains dynamic reviews:
       *
       * Dynamic Reviews
       * +
       * 6 Static Video Reviews
       */

      if (
        result &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        setReviews([
          ...result.data,
          ...reviewGallery,
        ]);

        setCurrent(0);
      } else {
        /*
         * Backend has no reviews.
         *
         * Show only the 6 static videos.
         */

        setReviews(reviewGallery);

        setCurrent(0);
      }
    } catch (error) {
      /*
       * Backend unavailable.
       *
       * Show only the 6 static videos.
       */

      console.error('Failed to load reviews:', error);

      setReviews(reviewGallery);

      setCurrent(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  /* =====================================================
     AUTO PLAY CAROUSEL
     Changes review every 1.5 seconds
  ===================================================== */

  useEffect(() => {
    if (reviews.length <= 1) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        return (prev + 1) % reviews.length;
      });
    }, 1500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [reviews.length]);

  /* =====================================================
     RESET AUTO PLAY
  ===================================================== */

  const resetAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (reviews.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => {
          return (prev + 1) % reviews.length;
        });
      }, 1500);
    }
  };

  /* =====================================================
     NEXT REVIEW
  ===================================================== */

  const nextReview = () => {
    setCurrent((prev) => {
      return (prev + 1) % reviews.length;
    });

    resetAutoPlay();
  };

  /* =====================================================
     PREVIOUS REVIEW
  ===================================================== */

  const previousReview = () => {
    setCurrent((prev) => {
      return (prev - 1 + reviews.length) % reviews.length;
    });

    resetAutoPlay();
  };

  /* =====================================================
     GO TO SPECIFIC REVIEW
  ===================================================== */

  const goToReview = (index) => {
    setCurrent(index);
    resetAutoPlay();
  };

  /* =====================================================
     GET CURRENT REVIEW
  ===================================================== */

  const review = reviews[current] || reviews[0];

  /* =====================================================
     SAFETY CHECK
  ===================================================== */

  if (!review) {
    return null;
  }

  /* =====================================================
     MAIN JSX
  ===================================================== */

  return (
    <section id="reviews" className="reviews-section">
      <div className="reviews-container">

        {/* =================================================
            HEADING
        ================================================= */}

        <div className="reviews-heading reveal">
          <span>CUSTOMER EXPERIENCES</span>

          <h2 className="reveal">
            What Our Travellers Say
          </h2>

          <p className="reveal">
            Real experiences from people who travelled with
            Shadow Tour Packages.
          </p>
        </div>

        {/* =================================================
            CAROUSEL
        ================================================= */}

        <div className="reviews-carousel reveal">

          {/* PREVIOUS BUTTON */}

          <button
            type="button"
            className="review-arrow review-arrow-left"
            onClick={previousReview}
            aria-label="Previous review"
          >
            <ChevronLeft size={22} />
          </button>

          {/* REVIEW CARD */}

          <div className="review-card-wrapper">
            <div className="review-card reveal">

              {/* =================================================
                  VIDEO REVIEW
              ================================================= */}

              {review.type === 'video' ? (
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

                /* =================================================
                   WRITTEN REVIEW
                ================================================= */

                <div className="written-review">

                  <div className="quote-mark">
                    “
                  </div>

                  <p className="review-text">
                    {review.review}
                  </p>

                </div>
              )}

              {/* =================================================
                  REVIEW INFORMATION
              ================================================= */}

              <div className="review-info">

                <div className="review-person">

                  <div className="review-avatar">
                    {review.name
                      ?.charAt(0)
                      ?.toUpperCase() || 'C'}
                  </div>

                  <div>
                    <h3>
                      {review.name || 'Customer'}
                    </h3>

                    <p>
                      {review.destination || 'Tour'}
                    </p>
                  </div>

                </div>

                {/* RATING */}

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

          {/* NEXT BUTTON */}

          <button
            type="button"
            className="review-arrow review-arrow-right"
            onClick={nextReview}
            aria-label="Next review"
          >
            <ChevronRight size={22} />
          </button>

        </div>

        {/* =================================================
            CAROUSEL DOTS
        ================================================= */}

        {reviews.length > 1 && (
          <div className="review-dots">

            {reviews.map((item, index) => (
              <button
                type="button"
                key={item._id || index}
                className={
                  index === current
                    ? 'review-dot active'
                    : 'review-dot'
                }
                onClick={() => goToReview(index)}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}

          </div>
        )}

        {/* =================================================
            ACTION BUTTON
        ================================================= */}

        <div className="review-actions">

          <button
            type="button"
            className="instagram-review-button"
            onClick={() =>
              window.open(
                INSTAGRAM_HIGHLIGHTS_URL,
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            <span>
              View Instagram Reviews
            </span>
          </button>

        </div>

        {/* =================================================
            OPTIONAL BACKEND STATUS
        ================================================= */}

        {loading && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '12px',
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