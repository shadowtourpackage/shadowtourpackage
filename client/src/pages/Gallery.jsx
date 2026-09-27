import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Film,
  Images,
  Play,
  X,
  Camera,
  Compass,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';

import { media, filters } from '../data/galleryMedia.js';

export default function Gallery() {
  const [filter, setFilter] = useState('All');
  const [activeId, setActiveId] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  const items = useMemo(
    () =>
      media.filter(
        (item) =>
          filter === 'All' ||
          item.kind === filter.slice(0, -1).toLowerCase()
      ),
    [filter]
  );

  const activeIndex = items.findIndex(
    (item) => item.id === activeId
  );

  const active = items[activeIndex];

  const changeActive = (direction) => {
    if (!items.length) return;

    const nextIndex =
      (activeIndex + direction + items.length) %
      items.length;

    setActiveId(items[nextIndex].id);
  };

  return (
    <section className="gallery-page" id="gallery">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="gallery-page__hero">

        <img
          src="/images/gallery/gallery.jpg"
          alt="Shadow Tour Background"
          className="gallery-page__hero-bg"
          onError={(e) => {
            e.currentTarget.src = media[0]?.src || '';
          }}
        />

        <div className="gallery-page__hero-overlay" />

        <div className="gallery-page__shell gallery-page__hero-content">

          <div className="gallery-page__intro">

            <p className="gallery-page__eyebrow reveal">
              SHADOW TOUR PACKAGES
            </p>

            <h1 className="reveal">
              STORIES <strong>ON THE ROAD</strong>
            </h1>

            <span className="gallery-page__brush" />

            <p className="reveal">
              Moments collected between the first hello and
              the road home. A glimpse of the journeys we
              share.
            </p>

            <div className="gallery-page__highlights reveal">

              <Highlight
                icon={Camera}
                title="Captured"
                text="Moments"
              />

              <Highlight
                icon={Compass}
                title="Endless"
                text="Journeys"
              />

              <Highlight
                icon={HeartHandshake}
                title="Happy"
                text="Travelers"
              />

              <Highlight
                icon={Sparkles}
                title="Pure"
                text="Memories"
              />

            </div>

            <a
              href="#gallery-grid"
              className="gallery-page__explore heartbeat reveal"
            >
              Our gallery
              <ArrowRight size={18} />
            </a>

          </div>

          <div className="gallery-page__hero-tag">

            <p className="gallery-page__hero-script reveal">
              With you.
              <br />
              like a <span>SHADOW!</span>
            </p>

          </div>

        </div>
      </section>

      {/* =====================================================
          GALLERY CONTENT
      ===================================================== */}

      <section
        className="gallery-page__content"
        id="gallery-grid"
      >

        <div className="gallery-page__shell">

          <div className="gallery-page__heading">

            <div>

              <p className="gallery-page__eyebrow reveal">
                GALLERY
              </p>

              <h2 className="reveal">
                MEMORIES MADE <strong>TOGETHER</strong>
              </h2>

            </div>

            <p className="reveal">
              Every turn brings a new view, a new laugh,
              and another story worth keeping.
            </p>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div
            className="gallery-page__filters"
            aria-label="Filter gallery"
          >

            {filters.map((label) => (

              <button
                key={label}
                type="button"
                onClick={() => {
                  setFilter(label);
                  setActiveId(null);
                  setPlayingId(null);
                }}
                className={
                  filter === label ? 'is-active' : ''
                }
              >

                {label === 'Photos' && (
                  <Images size={15} />
                )}

                {label === 'Videos' && (
                  <Film size={15} />
                )}

                {label}

              </button>

            ))}

          </div>

          {/* =================================================
              GALLERY GRID
          ================================================= */}

          <div className="gallery-page__masonry">

            {items.map((item, index) => (

              <MediaTile
                key={item.id}
                item={item}
                index={index}
                playingId={playingId}
                onPlay={(id) => setPlayingId(id)}
                onPause={() => setPlayingId(null)}
                onOpen={() => setActiveId(item.id)}
              />

            ))}

          </div>

        </div>
      </section>

      {/* =====================================================
          QUOTE
      ===================================================== */}

      <section className="gallery-page__quote">

        <div className="gallery-page__shell reveal">

          <span>“</span>

          <p>
            We don’t just take you to beautiful places.
            <br />
            <strong>
              We help make them unforgettable.
            </strong>
          </p>

          <span>”</span>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="gallery-page__cta">

        <div className="gallery-page__shell reveal">

          <div>

            <p className="gallery-page__eyebrow reveal">
              READY FOR YOUR STORY?
            </p>

            <h2 className="reveal">
              LET’S GO <strong>SOMEWHERE BEAUTIFUL</strong>
            </h2>

            <span className="gallery-page__brush reveal" />

            <p>
              Your next favourite memory starts with one
              journey.
            </p>

          </div>

          <a href="/#book">
            Plan your journey
            <ArrowRight size={18} />
          </a>

        </div>

      </section>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      {active && (
        <Lightbox
          item={active}
          onClose={() => setActiveId(null)}
          onNext={() => changeActive(1)}
          onPrevious={() => changeActive(-1)}
        />
      )}

    </section>
  );
}

/* =========================================================
   HIGHLIGHT
========================================================= */

function Highlight({ icon: Icon, title, text }) {
  return (
    <span>

      <Icon />

      <b>{title}</b>

      <small>{text}</small>

    </span>
  );
}

/* =========================================================
   MEDIA TILE
========================================================= */

function MediaTile({
  item,
  index,
  playingId,
  onPlay,
  onPause,
  onOpen,
}) {
  const isVideo = item.kind === 'video';
  const isPlaying = playingId === item.id;

  const handleClick = (e) => {
    if (isVideo) {
      e.preventDefault();

      if (isPlaying) {
        onPause();
      } else {
        onPlay(item.id);
      }

      return;
    }

    onOpen();
  };

  return (
    <button
      type="button"
      className={`gallery-page__tile gallery-page__tile--${item.size}`}
      onClick={handleClick}
      aria-label={
        isVideo
          ? `Play ${item.alt}`
          : `Open ${item.alt}`
      }
    >

      {isVideo ? (

        <div className="gallery-page__youtube-wrapper">

          {isPlaying ? (

            <iframe
              className="gallery-page__youtube"
              src={`${item.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
              title={item.alt}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

          ) : (

            <div className="gallery-page__youtube-placeholder">

              <img
                src={`https://img.youtube.com/vi/${getYouTubeId(
                  item.embedUrl
                )}/hqdefault.jpg`}
                alt={item.alt}
              />

              <span className="gallery-page__play">
                <Play
                  fill="currentColor"
                  size={20}
                />
              </span>

            </div>

          )}

        </div>

      ) : (

        <img
          src={item.src}
          alt={item.alt}
          loading={index > 2 ? 'lazy' : 'eager'}
          onError={(e) => {
            e.currentTarget.style.opacity = 0;
          }}
        />

      )}

      <span
        className="gallery-page__tile-fallback"
        aria-hidden="true"
      />

      <span className="gallery-page__tile-shade" />

      {!isVideo && (
        <span className="gallery-page__expand">
          View moment ↗
        </span>
      )}

      <span className="gallery-page__count">
        {String(index + 1).padStart(2, '0')}
      </span>

    </button>
  );
}

/* =========================================================
   GET YOUTUBE VIDEO ID
========================================================= */

function getYouTubeId(url) {
  if (!url) return '';

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes('youtu.be')) {
      return parsedUrl.pathname.substring(1);
    }

    if (parsedUrl.hostname.includes('youtube.com')) {
      return parsedUrl.searchParams.get('v') || '';
    }

    const embedMatch = parsedUrl.pathname.match(
      /\/embed\/([^/]+)/
    );

    return embedMatch ? embedMatch[1] : '';

  } catch {
    return '';
  }
}

/* =========================================================
   LIGHTBOX
========================================================= */

function Lightbox({
  item,
  onClose,
  onNext,
  onPrevious,
}) {
  return (
    <div
      className="gallery-page__lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={onClose}
    >

      {/* CLOSE */}

      <button
        type="button"
        className="gallery-page__close"
        onClick={onClose}
        aria-label="Close gallery"
      >
        <X />
      </button>

      {/* PREVIOUS */}

      <button
        type="button"
        className="gallery-page__lightbox-nav gallery-page__lightbox-nav--prev"
        onClick={(e) => {
          e.stopPropagation();
          onPrevious();
        }}
        aria-label="Previous item"
      >
        <ChevronLeft />
      </button>

      {/* MEDIA */}

      <div
        className="gallery-page__lightbox-media"
        onClick={(e) => e.stopPropagation()}
      >

        {item.kind === 'video' ? (

          <iframe
            src={`${item.embedUrl}?autoplay=1&rel=0`}
            title={item.alt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />

        ) : (

          <img
            src={item.src}
            alt={item.alt}
          />

        )}

        <p>{item.alt}</p>

      </div>

      {/* NEXT */}

      <button
        type="button"
        className="gallery-page__lightbox-nav gallery-page__lightbox-nav--next"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next item"
      >
        <ChevronRight />
      </button>

    </div>
  );
}

