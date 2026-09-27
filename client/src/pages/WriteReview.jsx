import { useState, useEffect } from 'react';
import { Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// Option A: If your logo is in src/assets/
import logoImg from '/images/logo.png'; 

// Option B: If your logo is in public/logo.png, you can simply use the string '/logo.png' below
import '../styles/WriteReview.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function WriteReviewPage() {
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    rating: 0,
    review: '',
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryName = params.get('name') || '';
    const queryDest = params.get('dest') || params.get('destination') || '';

    setFormData((prev) => ({
      ...prev,
      name: queryName,
      destination: queryDest,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleStarClick = (starValue) => {
    setFormData((prev) => ({ ...prev, rating: starValue }));
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: null }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.rating || formData.rating < 1) {
      errs.rating = 'Please choose a star rating.';
    }

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please enter your name (at least 2 characters).';
    }

    if (!formData.destination.trim()) {
      errs.destination = 'Please enter the destination you visited.';
    }

    if (!formData.review.trim() || formData.review.trim().length < 10) {
      errs.review = 'Review must be at least 10 characters long.';
    } else if (formData.review.trim().length > 500) {
      errs.review = 'Review cannot exceed 500 characters.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          destination: formData.destination,
          rating: Number(formData.rating),
          review: formData.review,
          type: 'text',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message || 'Submission failed.' });
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ general: 'Server is unreachable. Please verify your connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="standalone-review-page">
      <div className="write-review-container">
        {/* LOGO HEADER */}
        <div className="review-logo-container">
          <img src={logoImg} alt="Shadow Tour Packages" className="review-brand-logo" />
        </div>

        {submitted ? (
          <div className="write-review-success">
            <CheckCircle2 size={56} className="success-icon" />
            <h2>Thank You, {formData.name || 'Traveller'}!</h2>
            <p>Your review has been successfully submitted to Shadow Tour Packages.</p>
          </div>
        ) : (
          <form className="write-review-form" onSubmit={handleSubmit} noValidate>
            <div className="write-review-header">
              <span>CUSTOMER FEEDBACK</span>
              <h2>Rate Your Experience</h2>
              <p>Help us improve by sharing your trip memories.</p>
            </div>

            {errors.general && (
              <div className="review-error-banner">
                <AlertCircle size={18} />
                <span>{errors.general}</span>
              </div>
            )}

            {/* STAR RATING */}
            <div className="write-review-group">
              <label>Your Rating </label>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || formData.rating);

                  return (
                    <button
                      type="button"
                      key={star}
                      className="star-picker-btn"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={32}
                        stroke={isFilled ? '#f59e0b' : '#0f172a'}
                        fill={isFilled ? '#f59e0b' : 'none'}
                        strokeWidth={1.8}
                      />
                    </button>
                  );
                })}
              </div>
              {errors.rating && <span className="error-text">{errors.rating}</span>}
            </div>

            {/* NAME */}
            <div className="write-review-group">
              <label htmlFor="name">Your Name </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* DESTINATION */}
            <div className="write-review-group">
              <label htmlFor="destination">Destination Visited </label>
              <input
                id="destination"
                name="destination"
                type="text"
                placeholder="e.g. Chikmagalur, Mysore, Ooty"
                value={formData.destination}
                onChange={handleChange}
                className={errors.destination ? 'input-error' : ''}
              />
              {errors.destination && <span className="error-text">{errors.destination}</span>}
            </div>

            {/* REVIEW */}
            <div className="write-review-group">
              <label htmlFor="review">Your Review </label>
              <textarea
                id="review"
                name="review"
                rows="5"
                maxLength={500}
                placeholder="Describe your tour, vehicle condition, stays, and driver..."
                value={formData.review}
                onChange={handleChange}
                className={errors.review ? 'input-error' : ''}
              />
              <div className="char-count">{formData.review.length}/500</div>
              {errors.review && <span className="error-text">{errors.review}</span>}
            </div>

            <button type="submit" className="submit-review-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="btn-spinner" /> Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}