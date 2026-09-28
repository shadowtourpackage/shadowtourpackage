import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Film,
  Images,
  Play,
  Pause,
  X,
  Camera,
  Compass,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';

import { media, filters } from '../data/galleryMedia.js';

/* =========================================================
   EXTRACT YOUTUBE ID & CHECK IF SHORTS
========================================================= */
function getYouTubeId(url) {
  if (!url) return '';
  const match = String(url).match(
    /(?:shorts\/|youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)?([\w-]{11})/
  );
  return match ? match[1] : '';
}

function checkIsShort(item) {
  return (
    item.isShort ||
    item.embedUrl?.includes('/shorts/') ||
    item.kind === 'short'
  );
}

/* =========================================================
   MAIN GALLERY COMPONENT
========================================================= */
export default function Gallery() {
  const [filter, setFilter] = useState('All');
  const [activeId, setActiveId] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  const items = useMemo(() => {
    return media.filter((item) => {
      if (filter === 'All') return true;
      if (filter === 'Photos') return item.kind === 'photo';
      if (filter === 'Videos') return item.kind === 'video';
      return true;
    });
  }, [filter]);

  const activeIndex = items.findIndex((item) => item.id === activeId);
  const active = items[activeIndex];

  const changeActive = (direction) => {
    if (!items.length) return;
    const nextIndex = (activeIndex + direction + items.length) % items.length;
    setActiveId(items[nextIndex].id);
  };

  return (
    <section className="gallery-page" id="gallery">

      {/* HERO */}
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
            <p className="gallery-page__eyebrow reveal">SHADOW TOUR PACKAGES</p>
            <h1 className="reveal">
              STORIES <strong>ON THE ROAD</strong>
            </h1>
            <span className="gallery-page__brush" />
            <p className="reveal">
              Moments collected between the first hello and the road home. A glimpse of the journeys we share.
            </p>

            <div className="gallery-page__highlights reveal">
              <Highlight icon={Camera} title="Captured" text="Moments" />
              <Highlight icon={Compass} title="Endless" text="Journeys" />
              <Highlight icon={HeartHandshake} title="Happy" text="Travelers" />
              <Highlight icon={Sparkles} title="Pure" text="Memories" />
            </div>

            <a href="#gallery-grid" className="gallery-page__explore heartbeat reveal">
              Our gallery <ArrowRight size={18} />
            </a>
          </div>

          <div className="gallery-page__hero-tag">
            <p className="gallery-page__hero-script reveal">
              With you. <br /> like a <span>SHADOW!</span>
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT & FILTERS */}
      <section className="gallery-page__content" id="gallery-grid">
        <div className="gallery-page__shell">
          <div className="gallery-page__heading">
            <div>
              <p className="gallery-page__eyebrow reveal">GALLERY</p>
              <h2 className="reveal">
                MEMORIES MADE <strong>TOGETHER</strong>
              </h2>
            </div>
            <p className="reveal">
              Every turn brings a new view, a new laugh, and another story worth keeping.
            </p>
          </div>

          {/* FILTERS */}
          <div className="gallery-page__filters" aria-label="Filter gallery">
            {filters.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setFilter(label);
                  setActiveId(null);
                  setPlayingId(null);
                }}
                className={filter === label ? 'is-active' : ''}
              >
                {label === 'Photos' && <Images size={15} />}
                {label === 'Videos' && <Film size={15} />}
                {label}
              </button>
            ))}
          </div>

          {/* MASONRY GRID */}
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

      {/* LIGHTBOX */}
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
   MEDIA TILE (Shows Thumbnail Image First, Plays On Click)
========================================================= */
function MediaTile({ item, index, playingId, onPlay, onPause, onOpen }) {
  const isVideo = item.kind === 'video';
  const isShort = isVideo && checkIsShort(item);
  const isPlaying = playingId === item.id;
  const ytId = isVideo ? getYouTubeId(item.embedUrl) : '';

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause();
    } else {
      onPlay(item.id);
    }
  };

  return (
    <div
      className={`gallery-page__tile gallery-page__tile--${item.size || (isShort ? 'tall' : 'square')} ${
        isShort ? 'gallery-page__tile--short' : ''
      }`}
      onClick={() => {
        if (!isVideo) onOpen();
      }}
    >
      {isVideo ? (
        <div className="gallery-page__youtube-wrapper">
          {isPlaying ? (
            /* Live YouTube player when clicked */
            <iframe
              className="gallery-page__youtube"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              title={item.alt}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            /* Clear preview poster image */
            <img
              src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
              alt={item.alt}
              className="gallery-video-poster"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://i.ytimg.com/vi/${ytId}/0.jpg`;
              }}
            />
          )}

          {/* Centered Play / Pause Button Overlay */}
          <button
            type="button"
            className={`gallery-yt-overlay ${isPlaying ? 'is-playing' : ''}`}
            onClick={togglePlay}
            aria-label={isPlaying ? `Pause ${item.alt}` : `Play ${item.alt}`}
          >
            <span className="gallery-yt-playbtn">
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="icon-offset" />}
            </span>
          </button>

          <div className="gallery-video-tag">
            <Play size={12} fill="currentColor" />
            <span>Video</span>
          </div>
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

      {/* Lightbox Trigger */}
      <button
        type="button"
        className="gallery-page__expand"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        aria-label="Expand to full screen"
      >
        View moment ↗
      </button>

      <span className="gallery-page__count">
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  );
}

/* =========================================================
   LIGHTBOX COMPONENT
========================================================= */
function Lightbox({ item, onClose, onNext, onPrevious }) {
  const isVideo = item.kind === 'video';
  const isShort = isVideo && checkIsShort(item);
  const ytId = isVideo ? getYouTubeId(item.embedUrl) : '';

  return (
    <div
      className="gallery-page__lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="gallery-page__close"
        onClick={onClose}
        aria-label="Close gallery"
      >
        <X />
      </button>

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

      <div
        className={`gallery-page__lightbox-media ${isShort ? 'is-short-lightbox' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <div className="lightbox-video-container">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              title={item.alt}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <img src={item.src} alt={item.alt} />
        )}
        <p>{item.alt}</p>
      </div>

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