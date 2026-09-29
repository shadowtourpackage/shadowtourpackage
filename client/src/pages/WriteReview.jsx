import { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import logoImg from '/images/logo.png';
import '../styles/WriteReview.css';

/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_FUNCTION_URL =
  'https://xupwdvjbxxfmmqkkadjr.supabase.co/functions/v1';

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/* =====================================================
   WRITE REVIEW PAGE
===================================================== */

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

  /* =====================================================
     GET NAME / DESTINATION FROM URL
  ===================================================== */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const queryName = params.get('name') || '';

    const queryDest =
      params.get('dest') ||
      params.get('destination') ||
      '';

    setFormData((prev) => ({
      ...prev,
      name: queryName,
      destination: queryDest,
    }));
  }, []);

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  /* =====================================================
     HANDLE STAR RATING
  ===================================================== */

  const handleStarClick = (starValue) => {
    setFormData((prev) => ({
      ...prev,
      rating: starValue,
    }));

    if (errors.rating) {
      setErrors((prev) => ({
        ...prev,
        rating: null,
      }));
    }
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validate = () => {
    const errs = {};

    if (!formData.rating || formData.rating < 1) {
      errs.rating = 'Please choose a star rating.';
    }

    if (
      !formData.name.trim() ||
      formData.name.trim().length < 2
    ) {
      errs.name =
        'Please enter your name (at least 2 characters).';
    }

    if (!formData.destination.trim()) {
      errs.destination =
        'Please enter the destination you visited.';
    }

    if (
      !formData.review.trim() ||
      formData.review.trim().length < 10
    ) {
      errs.review =
        'Review must be at least 10 characters long.';
    } else if (formData.review.trim().length > 500) {
      errs.review =
        'Review cannot exceed 500 characters.';
    }

    return errs;
  };

  /* =====================================================
     SUBMIT REVIEW
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!SUPABASE_PUBLISHABLE_KEY) {
      setErrors({
        general:
          'Supabase configuration is missing. Please check VITE_SUPABASE_PUBLISHABLE_KEY.',
      });

      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_URL}/reviews`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',

            /* Required by @supabase/server */
            apikey: SUPABASE_PUBLISHABLE_KEY,
          },

          body: JSON.stringify({
            name: formData.name.trim(),

            destination:
              formData.destination.trim(),

            rating: Number(formData.rating),

            review: formData.review.trim(),

            type: 'text',
          }),
        }
      );

      const result = await response.json();

      console.log(
        '[Review Submission]',
        response.status,
        result
      );

      if (!response.ok || !result.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({
            general:
              result.message ||
              'Unable to submit your review.',
          });
        }

        return;
      }

      /* ===============================================
         REVIEW SUBMITTED
      =============================================== */

      setSubmitted(true);

    } catch (error) {
      console.error(
        '[Review Submission Error]',
        error
      );

      setErrors({
        general:
          'Server is unreachable. Please check your internet connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SUCCESS SCREEN
  ===================================================== */

  if (submitted) {
    return (
      <div className="standalone-review-page">
        <div className="write-review-container">

          <div className="review-logo-container">
            <img
              src={logoImg}
              alt="Shadow Tour Packages"
              className="review-brand-logo"
            />
          </div>

          <div className="write-review-success">

            <CheckCircle2
              size={56}
              className="success-icon"
            />

            <h2>
              Thank You,{' '}
              {formData.name || 'Traveller'}!
            </h2>

            <p>
              Your review has been successfully
              submitted to Shadow Tour Packages.
            </p>

            <p>
              Your review will be visible after
              approval.
            </p>

          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     REVIEW FORM
  ===================================================== */

  return (
    <div className="standalone-review-page">

      <div className="write-review-container">

        {/* LOGO */}

        <div className="review-logo-container">

          <img
            src={logoImg}
            alt="Shadow Tour Packages"
            className="review-brand-logo"
          />

        </div>

        {/* FORM */}

        <form
          className="write-review-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* HEADER */}

          <div className="write-review-header">

            <span>
              CUSTOMER FEEDBACK
            </span>

            <h2>
              Rate Your Experience
            </h2>

            <p>
              Help us improve by sharing your
              trip memories.
            </p>

          </div>

          {/* GENERAL ERROR */}

          {errors.general && (
            <div className="review-error-banner">

              <AlertCircle size={18} />

              <span>
                {errors.general}
              </span>

            </div>
          )}

          {/* =================================================
              STAR RATING
          ================================================= */}

          <div className="write-review-group">

            <label>
              Your Rating
            </label>

            <div className="star-picker">

              {[1, 2, 3, 4, 5].map(
                (star) => {

                  const isFilled =
                    star <=
                    (hoverRating ||
                      formData.rating);

                  return (
                    <button
                      type="button"
                      key={star}
                      className="star-picker-btn"

                      onClick={() =>
                        handleStarClick(star)
                      }

                      onMouseEnter={() =>
                        setHoverRating(star)
                      }

                      onMouseLeave={() =>
                        setHoverRating(0)
                      }

                      aria-label={`Rate ${star} star${
                        star > 1
                          ? 's'
                          : ''
                      }`}
                    >

                      <Star
                        size={32}
                        stroke={
                          isFilled
                            ? '#f59e0b'
                            : '#0f172a'
                        }
                        fill={
                          isFilled
                            ? '#f59e0b'
                            : 'none'
                        }
                        strokeWidth={1.8}
                      />

                    </button>
                  );
                }
              )}

            </div>

            {errors.rating && (
              <span className="error-text">
                {errors.rating}
              </span>
            )}

          </div>

          {/* =================================================
              NAME
          ================================================= */}

          <div className="write-review-group">

            <label htmlFor="name">
              Your Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              className={
                errors.name
                  ? 'input-error'
                  : ''
              }
            />

            {errors.name && (
              <span className="error-text">
                {errors.name}
              </span>
            )}

          </div>

          {/* =================================================
              DESTINATION
          ================================================= */}

          <div className="write-review-group">

            <label htmlFor="destination">
              Destination Visited
            </label>

            <input
              id="destination"
              name="destination"
              type="text"
              placeholder="e.g. Chikmagalur, Mysore, Ooty"
              value={formData.destination}
              onChange={handleChange}
              className={
                errors.destination
                  ? 'input-error'
                  : ''
              }
            />

            {errors.destination && (
              <span className="error-text">
                {errors.destination}
              </span>
            )}

          </div>

          {/* =================================================
              REVIEW
          ================================================= */}

          <div className="write-review-group">

            <label htmlFor="review">
              Your Review
            </label>

            <textarea
              id="review"
              name="review"
              rows="5"
              maxLength={500}
              placeholder="Describe your tour, vehicle condition, stays, and driver..."
              value={formData.review}
              onChange={handleChange}
              className={
                errors.review
                  ? 'input-error'
                  : ''
              }
            />

            <div className="char-count">
              {formData.review.length}/500
            </div>

            {errors.review && (
              <span className="error-text">
                {errors.review}
              </span>
            )}

          </div>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="submit-review-btn"
            disabled={loading}
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="btn-spinner"
                />

                Submitting...
              </>
            ) : (
              'Submit Review'
            )}

          </button>

        </form>

      </div>

    </div>
  );
}