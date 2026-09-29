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

/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_FUNCTION_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;


/* =====================================================
   HELPER TO EXTRACT YOUTUBE VIDEO ID

   Supports:
   - Normal YouTube URLs
   - YouTube Shorts
   - youtu.be URLs
   - embed URLs
   - watch?v=
   - Raw 11-character IDs
===================================================== */

function getYouTubeId(urlOrId) {
  if (!urlOrId) return '';

  const match = String(urlOrId).match(
    /(?:shorts\/|youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)?([\w-]{11})/
  );

  return match ? match[1] : urlOrId;
}


/* =====================================================
   CUSTOM YOUTUBE PLAYER COMPONENT

   Hides all YouTube controls except custom
   Play / Pause control.
===================================================== */

function YouTubePlayer({ videoId, title }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);


  /* ===================================================
     LOAD YOUTUBE IFRAME API
  =================================================== */

  useEffect(() => {

    if (!window.YT) {

      const tag = document.createElement('script');

      tag.src =
        'https://www.youtube.com/iframe_api';

      document.body.appendChild(tag);
    }


    let playerInstance = null;


    /* =================================================
       INITIALIZE PLAYER
    ================================================= */

    const initPlayer = () => {

      if (
        !containerRef.current ||
        !window.YT ||
        !window.YT.Player
      ) {
        return;
      }


      playerInstance =
        new window.YT.Player(
          containerRef.current,
          {
            videoId: videoId,

            playerVars: {
              controls: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              disablekb: 1,
              fs: 0,
            },

            events: {

              onReady: () => {
                setIsReady(true);
              },


              onStateChange: (event) => {

                /*
                  1 = Playing
                  2 = Paused
                  0 = Ended
                */

                if (
                  event.data ===
                  window.YT.PlayerState.PLAYING
                ) {

                  setIsPlaying(true);

                } else {

                  setIsPlaying(false);

                }
              },

            },
          }
        );


      playerRef.current = playerInstance;
    };


    /* =================================================
       INITIALIZE IMMEDIATELY IF API EXISTS
    ================================================= */

    if (
      window.YT &&
      window.YT.Player
    ) {

      initPlayer();

    } else {

      /*
        YouTube API calls this when ready.
      */

      window.onYouTubeIframeAPIReady =
        initPlayer;
    }


    /* =================================================
       CLEANUP
    ================================================= */

    return () => {

      if (
        playerRef.current &&
        playerRef.current.destroy
      ) {

        playerRef.current.destroy();
      }

    };

  }, [videoId]);


  /* =====================================================
     PLAY / PAUSE
  ===================================================== */

  const togglePlay = () => {

    if (
      !playerRef.current ||
      !isReady
    ) {
      return;
    }


    if (isPlaying) {

      playerRef.current.pauseVideo();

    } else {

      playerRef.current.playVideo();

    }
  };


  /* =====================================================
     PLAYER UI
  ===================================================== */

  return (

    <div className="custom-yt-container">

      <div
        ref={containerRef}
        className="yt-frame"
      />


      {/* ===============================================
          FULL FRAME PLAY / PAUSE OVERLAY
      =============================================== */}

      <button
        type="button"

        className={`yt-play-toggle-overlay ${
          isPlaying
            ? 'is-playing'
            : ''
        }`}

        onClick={togglePlay}

        aria-label={
          isPlaying
            ? 'Pause video'
            : 'Play video'
        }
      >

        <span className="yt-control-btn">

          {isPlaying ? (

            <Pause size={28} />

          ) : (

            <Play
              size={28}
              className="translate-x"
            />

          )}

        </span>

      </button>

    </div>
  );
}


/* =====================================================
   MAIN REVIEW SECTION
===================================================== */

export default function ReviewSection() {

  /*
    IMPORTANT:

    Start with static reviewGallery so that
    static videos are available immediately.

    After Supabase loads, customer reviews are
    placed FIRST and static reviews remain AFTER.
  */

  const [reviews, setReviews] =
    useState(reviewGallery);

  const [current, setCurrent] =
    useState(0);

  const [loading, setLoading] =
    useState(true);


  /* =====================================================
     LOAD REVIEWS FROM SUPABASE
  ===================================================== */

  const loadReviews = useCallback(
    async () => {

      try {

        /*
          Check that the publishable key exists.
        */

        if (!SUPABASE_PUBLISHABLE_KEY) {

          console.error(
            'VITE_SUPABASE_PUBLISHABLE_KEY is missing.'
          );

          /*
            If Supabase key is missing,
            still show static reviews.
          */

          setReviews(reviewGallery);

          setCurrent(0);

          return;
        }


        /* ===============================================
           GET REVIEWS FROM SUPABASE EDGE FUNCTION
        =============================================== */

        const response = await fetch(
          `${SUPABASE_FUNCTION_URL}/reviews`,
          {
            method: 'GET',

            headers: {
              /*
                Required by @supabase/server
              */

              apikey:
                SUPABASE_PUBLISHABLE_KEY,

              /*
                Also send Authorization.

                This is useful if your Edge Function
                or future Supabase configuration
                checks authorization.
              */

              Authorization:
                `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,

              'Content-Type':
                'application/json',
            },
          }
        );


        /* ===============================================
           PARSE RESPONSE
        =============================================== */

        const result =
          await response.json();


        console.log(
          '[Supabase Reviews]',
          result
        );


        /* ===============================================
           CUSTOMER REVIEWS FOUND
        =============================================== */

        if (
          response.ok &&
          result &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {

          /*
            IMPORTANT ORDER:

            1. Supabase customer reviews
            2. Static reviewGallery videos

            Do NOT change this order.
          */

          setReviews([
            ...result.data,
            ...reviewGallery,
          ]);

          setCurrent(0);

        } else {

          /*
            No customer reviews.

            Show static reviews/videos.
          */

          setReviews(reviewGallery);

          setCurrent(0);

        }

      } catch (error) {

        console.error(
          'Failed to load reviews:',
          error
        );


        /*
          If Supabase is unavailable,
          don't break the website.

          Static reviews/videos remain available.
        */

        setReviews(reviewGallery);

        setCurrent(0);

      } finally {

        setLoading(false);

      }

    },
    []
  );


  /* =====================================================
     LOAD REVIEWS WHEN COMPONENT MOUNTS
  ===================================================== */

  useEffect(() => {

    loadReviews();

  }, [loadReviews]);


  /* =====================================================
     NEXT REVIEW
  ===================================================== */

  const nextReview = () => {

    setCurrent(
      (prev) =>
        (prev + 1) %
        reviews.length
    );

  };


  /* =====================================================
     PREVIOUS REVIEW
  ===================================================== */

  const previousReview = () => {

    setCurrent(
      (prev) =>
        (prev - 1 + reviews.length) %
        reviews.length
    );

  };


  /* =====================================================
     GO TO SPECIFIC REVIEW
  ===================================================== */

  const goToReview = (index) => {

    setCurrent(index);

  };


  /* =====================================================
     CURRENT REVIEW
  ===================================================== */

  const review =
    reviews[current] ||
    reviews[0];


  if (!review) {
    return null;
  }


  /* =====================================================
     DETERMINE IF REVIEW IS SHORT
  ===================================================== */

  const isShort =
    review.isShort ||
    review.type === 'short' ||
    review.youtubeUrl?.includes(
      '/shorts/'
    ) ||
    review.youtubeId?.includes(
      '/shorts/'
    );


  /* =====================================================
     DETERMINE IF REVIEW IS WRITTEN
  ===================================================== */

  const isWritten =
    !review.type ||
    review.type === 'written';


  /* =====================================================
     CARD LAYOUT
  ===================================================== */

  const cardLayoutClass =
    isShort
      ? 'card-layout-short'
      : isWritten
        ? 'card-layout-square'
        : 'card-layout-standard';


  /* =====================================================
     YOUTUBE ID
  ===================================================== */

  const ytId =
    getYouTubeId(
      review.youtubeId ||
      review.youtubeUrl
    );


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <section
      id="reviews"
      className="reviews-section"
    >

      <div className="reviews-container">


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="reviews-heading reveal">

          <span>
            CUSTOMER EXPERIENCES
          </span>

          <h2 className="reveal">
            What Our Travellers Say
          </h2>

          <p className="reveal">
            Real experiences from people who
            travelled with Shadow Tour Packages.
          </p>

        </div>


        {/* =================================================
            REVIEW VIEWER
        ================================================= */}

        <div className="reviews-viewer reveal">


          {/* =================================================
              LEFT ARROW
          ================================================= */}

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


          {/* =================================================
              CARD WRAPPER
          ================================================= */}

          <div
            className={`review-card-wrapper ${cardLayoutClass}`}
          >

            <div className="review-card reveal">


              {/* =================================================
                  YOUTUBE VIDEO / SHORTS
              ================================================= */}

              {review.type === 'youtube' ||
              review.type === 'short' ||
              ytId ? (

                <div
                  className={`review-video-container ${
                    isShort
                      ? 'is-short'
                      : ''
                  }`}
                >

                  <div className="youtube-embed-wrapper">

                    <YouTubePlayer
                      key={
                        ytId ||
                        review._id
                      }

                      videoId={ytId}

                      title={`${
                        review.name ||
                        'Customer'
                      } - ${
                        review.destination ||
                        'Tour'
                      }`}
                    />

                  </div>


                  <div className="video-label">

                    <Play size={15} />

                    <span>
                      {isShort
                        ? 'Short Review'
                        : 'Video Review'}
                    </span>

                  </div>

                </div>


              ) : review.type === 'video' ? (

                /* =================================================
                    NORMAL HTML5 VIDEO FILE
                ================================================= */

                <div className="review-video-container">

                  <video
                    className="review-video"

                    src={
                      review.videoUrl
                    }

                    controls

                    playsInline

                    preload="metadata"
                  />

                  <div className="video-label">

                    <Play size={15} />

                    <span>
                      Video Review
                    </span>

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
                  CUSTOMER INFO + RATING
              ================================================= */}

              <div className="review-info">


                {/* CUSTOMER */}

                <div className="review-person">

                  <div className="review-avatar">

                    {review.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      'C'}

                  </div>


                  <div>

                    <h3>
                      {review.name ||
                        'Customer'}
                    </h3>

                    <p>
                      {review.destination ||
                        'Tour'}
                    </p>

                  </div>

                </div>


                {/* RATING */}

                <div className="review-rating">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (

                      <Star
                        key={star}

                        size={16}

                        fill={
                          star <=
                          Number(
                            review.rating ||
                              5
                          )
                            ? 'currentColor'
                            : 'none'
                        }
                      />

                    )
                  )}

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT ARROW
          ================================================= */}

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


        {/* =================================================
            PAGINATION DOTS
        ================================================= */}

        {reviews.length > 1 && (

          <div className="review-dots">

            {reviews.map(
              (item, index) => (

                <button
                  type="button"

                  key={
                    item._id ||
                    index
                  }

                  className={
                    index === current
                      ? 'review-dot active'
                      : 'review-dot'
                  }

                  onClick={() =>
                    goToReview(index)
                  }

                  aria-label={`Go to review ${
                    index + 1
                  }`}
                />

              )
            )}

          </div>

        )}


        {/* =================================================
            LOADING MESSAGE
        ================================================= */}

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