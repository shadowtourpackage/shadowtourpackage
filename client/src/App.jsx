import { useEffect, useState } from 'react';

import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';

import Hero from './components/sections/Hero.jsx';
import About from './components/sections/About.jsx';
import DestinationsSection from './components/sections/DestinationsSection.jsx';
import FleetSnippet from './components/sections/FleetSnippet.jsx';
import ReviewSection from './components/sections/ReviewSection.jsx';
import ContactSection from './components/sections/ContactSection.jsx';

import Fleet from './pages/Fleet.jsx';
import Gallery from './pages/Gallery.jsx';
import Destinations from './pages/Destinations.jsx';
import WriteReviewPage from './pages/WriteReview.jsx';
import AdminEnquiries from './pages/AdminEnquiries.jsx';

import { fallbackDestinations } from './data/destinations.js';

import './styles/index.css';


/* =====================================================
   API
===================================================== */

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';


/* =====================================================
   SMOOTH SCROLL
===================================================== */

const scroll = (id) => {
  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior: 'smooth',
    });
};


/* =====================================================
   APP
===================================================== */

export default function App() {

  const [menu, setMenu] = useState(false);


  /* =====================================================
     CURRENT PAGE
  ===================================================== */

  const [page, setPage] = useState(() => {
    // Normalize path to handle optional trailing slashes
    const path = window.location.pathname.replace(/\/+$/, '') || '/';

    if (path === '/fleet') {
      return 'fleet';
    }

    if (path === '/gallery') {
      return 'gallery';
    }

    if (path === '/destinations') {
      return 'destinations';
    }

    /* Private Review Page */
    if (path === '/write-review') {
      return 'write-review';
    }

    /* Admin Enquiry Board */
    if (path === '/enquiryboard') {
      return 'enquiryboard';
    }

    return 'home';
  });


  /* =====================================================
     DESTINATIONS
  ===================================================== */

  const [destinations, setDestinations] =
    useState(fallbackDestinations);


  /* =====================================================
     ACTIVE NAVIGATION
  ===================================================== */

  const [active, setActive] =
    useState('Home');


  /* =====================================================
     LOAD DESTINATIONS
  ===================================================== */

  useEffect(() => {
    fetch(`${API_BASE}/destinations`)
      .then((response) => response.json())
      .then((result) => {
        if (result && result.data) {
          setDestinations(result.data);
        }
      })
      .catch(() => {
        // Keep fallback destinations
      });
  }, []);


  /* =====================================================
     BROWSER BACK / FORWARD
  ===================================================== */

  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';

      if (path === '/fleet') {
        setPage('fleet');
      } else if (path === '/gallery') {
        setPage('gallery');
      } else if (path === '/destinations') {
        setPage('destinations');
      } else if (path === '/write-review') {
        setPage('write-review');
      } else if (path === '/enquiryboard') {
        setPage('enquiryboard');
      } else {
        setPage('home');
      }
    };

    window.addEventListener('popstate', syncRoute);

    return () => {
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);


  /* =====================================================
     REVEAL ANIMATION
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      const revealElements =
        document.querySelectorAll('.reveal');

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('show');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      revealElements.forEach((element) => {
        observer.observe(element);
      });

      return () => {
        observer.disconnect();
      };
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [page]);


  /* =====================================================
     ACTIVE NAVIGATION (ON SCROLL)
  ===================================================== */

  useEffect(() => {
    if (page === 'fleet') {
      setActive('Our Fleet');
      return;
    }

    if (page === 'gallery') {
      setActive('Gallery');
      return;
    }

    if (page === 'destinations') {
      setActive('Destinations');
      return;
    }

    if (page === 'write-review' || page === 'enquiryboard') {
      setActive('');
      return;
    }

    /* Home page sections */
    const sections = [
      { id: 'home', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'destinations', label: 'Destinations' },
      { id: 'reviews', label: 'Reviews' },
      { id: 'contact', label: 'Contact' },
    ];

    const onScroll = () => {
      const headerOffset = 100;
      let current = 'Home';

      for (const section of sections) {
        const element = document.getElementById(section.id);

        if (!element) continue;

        const top = element.getBoundingClientRect().top;

        if (top - headerOffset <= 0) {
          current = section.label;
        }
      }

      setActive(current);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [page]);


  /* =====================================================
     NAVIGATION
  ===================================================== */

  function navigateTo(id) {
    setMenu(false);

    /* Separate Pages */
    if (
      id === 'fleet' ||
      id === 'gallery' ||
      id === 'destinations' ||
      id === 'write-review' ||
      id === 'enquiryboard'
    ) {
      window.history.pushState({}, '', `/${id}`);
      setPage(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    /* Home */
    if (id === 'home') {
      if (page !== 'home') {
        window.history.pushState({}, '', '/');
        setPage('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    /* Home Sections */
    if (page !== 'home') {
      window.history.pushState({}, '', '/');
      setPage('home');

      requestAnimationFrame(() => {
        setTimeout(() => {
          scroll(id);
        }, 50);
      });

      return;
    }

    scroll(id);
  }


  /* =====================================================
     STANDALONE PRIVATE REVIEW PAGE VIEW
  ===================================================== */

  if (page === 'write-review') {
    return (
      <main>
        <WriteReviewPage navigateTo={navigateTo} />
      </main>
    );
  }


  /* =====================================================
     STANDALONE ADMIN ENQUIRY DASHBOARD VIEW
  ===================================================== */

  if (page === 'enquiryboard') {
    return (
      <main>
        <AdminEnquiries navigateTo={navigateTo} />
      </main>
    );
  }


  /* =====================================================
     STANDARD SITE RENDER
  ===================================================== */

  return (
    <>
      <Header
        menu={menu}
        setMenu={setMenu}
        active={active}
        navigateTo={navigateTo}
      />

      <main>
        {page === 'fleet' ? (
          <Fleet />
        ) : page === 'gallery' ? (
          <Gallery />
        ) : page === 'destinations' ? (
          <Destinations navigateTo={navigateTo} />
        ) : (
          <>
            <Hero navigateTo={navigateTo} scroll={scroll} />
            <About navigateTo={navigateTo} />
            <DestinationsSection
              destinations={destinations}
              scroll={scroll}
              navigateTo={navigateTo}
            />
            <FleetSnippet navigateTo={navigateTo} />
            <ReviewSection navigateTo={navigateTo} />
            <ContactSection />
          </>
        )}
      </main>

      <Footer navigateTo={navigateTo} />
    </>
  );
}