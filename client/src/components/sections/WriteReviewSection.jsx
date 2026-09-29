import { useState } from 'react';
import { Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import '../../styles/WriteReview.css';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const REVIEW_SUBMITTED_KEY = 'shadow_tour_review_submitted';

export default function WriteReviewSection({ onReviewSubmitted }) {
  // Check localStorage when the component loads
  const [submitted, setSubmitted] = useState(() => {
    return localStorage.getItem(REVIEW_SUBMITTED_KEY) === 'true';
  });

  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    rating: 5,
    review: '',
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const errs = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please enter your name (at least 2 characters).';
    }

    if (!formData.destination.trim()) {
      errs.destination = 'Please enter the destination you visited.';
    }

    if (
      !formData.review.trim() ||
      formData.review.trim().length < 10
    ) {
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
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          destination: formData.destination.trim(),
          rating: Number(formData.rating),
          review: formData.review.trim(),
          type: 'text',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({
            general: result.message || 'Submission failed.',
          });
        }

        return;
      }

      /*
       * IMPORTANT:
       * Save the submitted state in localStorage.
       *
       * This means the success screen will remain visible
       * even after refreshing the page or opening the URL again
       * in the same browser.
       */
      localStorage.setItem(REVIEW_SUBMITTED_KEY, 'true');

      setSubmitted(true);

      if (onReviewSubmitted) {
        onReviewSubmitted(result.data);
      }
    } catch (error) {
      console.error('Review submission error:', error);

      setErrors({
        general:
          'Server is unreachable. Please verify your connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    /*
     * Remove the saved submission flag.
     * This allows the user to submit another review.
     */
    localStorage.removeItem(REVIEW_SUBMITTED_KEY);

    setSubmitted(false);

    setFormData({
      name: '',
      destination: '',
      rating: 5,
      review: '',
    });

    setErrors({});
  };

  return (
    <section className="write-review-section">
      <div className="write-review-container">
        {submitted ? (
          <div className="write-review-success">
            <CheckCircle2
              size={54}
              className="success-icon"
            />

            <h2>Thank You for Your Feedback!</h2>

            <p>
              Your review has been submitted and will appear on
              the site once approved by our team.
            </p>

            <button
              className="write-another-btn"
              onClick={handleReset}
            >
              Submit Another Review
            </button>
          </div>
        ) : (
          <form
            className="write-review-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="write-review-header">
              <span>FEEDBACK</span>

              <h2>Share Your Travel Experience</h2>

              <p>
                Tell us how your trip went with Shadow Tour
                Packages.
              </p>
            </div>

            {errors.general && (
              <div className="review-error-banner">
                <AlertCircle size={18} />

                <span>{errors.general}</span>
              </div>
            )}

            {/* Rating */}
            <div className="write-review-group">
              <label>Your Rating</label>

              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className="star-picker-btn"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        rating: star,
                      }))
                    }
                    onMouseEnter={() =>
                      setHoverRating(star)
                    }
                    onMouseLeave={() =>
                      setHoverRating(0)
                    }
                  >
                    <Star
                      size={26}
                      fill={
                        star <=
                          (hoverRating || formData.rating)
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
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
                  errors.name ? 'input-error' : ''
                }
              />

              {errors.name && (
                <span className="error-text">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Destination */}
            <div className="write-review-group">
              <label htmlFor="destination">
                Destination Visited
              </label>

              <input
                id="destination"
                name="destination"
                type="text"
                placeholder="e.g. Ernakulam, Mysore ,Ooty, Kanthallur & Marayur"
                value={formData.destination}
                onChange={handleChange}
                className={
                  errors.destination ? 'input-error' : ''
                }
              />

              {errors.destination && (
                <span className="error-text">
                  {errors.destination}
                </span>
              )}
            </div>

            {/* Review */}
            <div className="write-review-group">
              <label htmlFor="review">
                Your Review
              </label>

              <textarea
                id="review"
                name="review"
                rows="5"
                maxLength={500}
                placeholder="Describe your tour, vehicle condition, stays, and service..."
                value={formData.review}
                onChange={handleChange}
                className={
                  errors.review ? 'input-error' : ''
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

            {/* Submit */}
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
        )}
      </div>
    </section>
  );
}
