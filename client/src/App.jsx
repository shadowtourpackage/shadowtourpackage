import { useEffect, useState } from 'react';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import Hero from './components/sections/Hero.jsx';
import About from './components/sections/About.jsx';
import DestinationsSection from './components/sections/DestinationsSection.jsx';
import FleetSnippet from './components/sections/FleetSnippet.jsx';
import ContactSection from './components/sections/ContactSection.jsx';
import Fleet from './pages/Fleet.jsx';
import Gallery from './pages/Gallery.jsx';
import { fallbackDestinations } from './data/destinations.js';
import "./styles/index.css";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function App() {
  const [menu, setMenu] = useState(false);
  const [page, setPage] = useState(() =>
    window.location.pathname === '/fleet' ? 'fleet' :
      window.location.pathname === '/gallery' ? 'gallery' : 'home'
  );
  const [destinations, setDestinations] = useState(fallbackDestinations);
  const [active, setActive] = useState('Home');

  useEffect(() => {
    fetch(`${API_BASE}/destinations`)
      .then((r) => r.json())
      .then((x) => x.data && setDestinations(x.data))
      .catch(() => { });
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      setPage(
        window.location.pathname === '/fleet' ? 'fleet' :
          window.location.pathname === '/gallery' ? 'gallery' : 'home'
      );
    };
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const revealElements = document.querySelectorAll(".reveal");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      revealElements.forEach((element) => {
        observer.observe(element);
      });

      return () => observer.disconnect();
    }, 50);

    return () => clearTimeout(timer);
  }, [page]);

  useEffect(() => {
    if (page === 'fleet') {
      setActive('Our Fleet');
      return;
    }
    if (page === 'gallery') {
      setActive('Gallery');
      return;
    }

    const sections = [
      { id: 'home', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'destinations', label: 'Destinations' },
      { id: 'contact', label: 'Contact' },
    ];

    const onScroll = () => {
      const headerOffset = 100;
      let current = 'Home';

      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - headerOffset <= 0) {
          current = s.label;
        }
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [page]);

  function navigateTo(id) {
    setMenu(false);
    if (id === 'fleet' || id === 'gallery') {
      window.history.pushState({}, '', `/${id}`);
      setPage(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page !== 'home') {
      window.history.pushState({}, '', '/');
      setPage('home');
      requestAnimationFrame(() => scroll(id));
      return;
    }
    scroll(id);
  }

  return (
    <>
      <Header menu={menu} setMenu={setMenu} active={active} navigateTo={navigateTo} />

      <main>
        {page === 'fleet' ? (
          <Fleet />
        ) : page === 'gallery' ? (
          <Gallery />
        ) : (
          <>
            <Hero navigateTo={navigateTo} scroll={scroll} />
            <About navigateTo={navigateTo} />
            <DestinationsSection destinations={destinations} scroll={scroll} />
            <FleetSnippet navigateTo={navigateTo} />
            <ContactSection />
          </>
        )}
      </main>

      <Footer navigateTo={navigateTo} />
    </>
  );
}