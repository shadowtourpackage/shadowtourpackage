import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  PenLine,
  ChartAreaIcon,
} from 'lucide-react';
import WriteReviewSection from './WriteReviewSection';
import '../../styles/ReviewSection.css';

const INSTAGRAM_HIGHLIGHTS_URL =
  'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDUzMzQwMDQ0NDQxMjQ0?story_media_id=3820831953520844477_78515209510&stkn=bTB0cXI0a3k0dTh5';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fallbackReviews = [
  {
    _id: 'fallback-1',
    type: 'text',
    name: 'Rahul',
    destination: 'Chikmagalur',
    rating: 5,
    review:
      'Amazing experience with Shadow Tour Packages. Everything was well organised and the trip was really enjoyable.',
  },
  {
    _id: 'fallback-2',
    type: 'video',
    name: 'Customer Review',
    destination: 'Chikmagalur',
    rating: 5,
    videoUrl: '/videos/reviews/review1.mp4',
  },
  {
    _id: 'fallback-3',
    type: 'text',
    name: 'Anjali',
    destination: 'Mysore',
    rating: 5,
    review:
      'The whole journey was comfortable and memorable. Highly recommended for group trips.',
  },
  {
    _id: 'fallback-4',
    type: 'video',
    name: 'Customer Review',
    destination: 'Mysore',
    rating: 5,
    videoUrl: '/videos/reviews/review2.mp4',
  },
];

export default function ReviewSection() {
  const [reviews, setReviews] = useState(fallbackReviews);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const formRef = useRef(null);

  // Wrap fetch in useCallback so we can call it after review submission
  const loadReviews = useCallback(() => {
    fetch(`${API_BASE}/reviews`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load reviews');
        }
        return response.json();
      })
      .then((result) => {
        if (result.data && result.data.length > 0) {
          setReviews(result.data);
        }
      })
      .catch(() => {
        setReviews(fallbackReviews);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const nextReview = () => {
    setCurrent((previous) => (previous + 1) % reviews.length);
  };

  const previousReview = () => {
    setCurrent((previous) => (previous - 1 + reviews.length) % reviews.length);
  };

  const handleWriteReviewClick = () => {
    setShowWriteReview((prev) => !prev);
    if (!showWriteReview) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Callback passed to WriteReviewSection: adds the review immediately to state & snaps to it
  const handleReviewSubmitted = (newReview) => {
    if (newReview) {
      setReviews((prev) => [newReview, ...prev]);
      setCurrent(0);
    }
  };

  const review = reviews[current] || reviews[0];

  if (loading) {
    return (
      <section id="reviews" className="reviews-section">
        <div className="reviews-container">
          <div className="reviews-heading">
            <span>CUSTOMER EXPERIENCES</span>
            <h2>What Our Travellers Say</h2>
          </div>
          <div className="reviews-loading">Loading reviews...</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="reviews" className="reviews-section">
        <div className="reviews-container">
          <div className="reviews-heading">
            <span>CUSTOMER EXPERIENCES</span>
            <h2>What Our Travellers Say</h2>
            <p>Real experiences from people who travelled with Shadow Tour Packages.</p>
          </div>

          <div className="reviews-carousel">
            <button
              className="review-arrow review-arrow-left"
              onClick={previousReview}
              aria-label="Previous review"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="review-card-wrapper">
              <div className="review-card">
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
                      <Play size={15} /> Video Review
                    </div>
                  </div>
                ) : (
                  <div className="written-review">
                    <div className="quote-mark">“</div>
                    <p className="review-text">{review.review}</p>
                  </div>
                )}

                <div className="review-info">
                  <div className="review-person">
                    <div className="review-avatar">
                      {review.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h3>{review.name}</h3>
                      <p>{review.destination}</p>
                    </div>
                  </div>

                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= Number(review.rating || 5) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              className="review-arrow review-arrow-right"
              onClick={nextReview}
              aria-label="Next review"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <div className="review-dots">
            {reviews.map((item, index) => (
              <button
                key={item._id || index}
                className={index === current ? 'review-dot active' : 'review-dot'}
                onClick={() => setCurrent(index)}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>

          <div className="review-actions">

            <button
              className="instagram-review-button"
              onClick={() => window.open(INSTAGRAM_HIGHLIGHTS_URL, '_blank', 'noopener,noreferrer')}
            >
              <ChartAreaIcon size={18} /> View Instagram Reviews
            </button>
          </div>
        </div>
      </section>

      {/* Conditionally rendered form section below the carousel */}
      {showWriteReview && (
        <div ref={formRef}>
          <WriteReviewSection onReviewSubmitted={handleReviewSubmitted} />
        </div>
      )}
    </>
  );
}