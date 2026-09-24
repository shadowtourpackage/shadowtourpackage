import { BusFront, Hotel, Mountain, ShieldCheck } from 'lucide-react';
import Button from '../common/Button.jsx';

export default function Hero({ navigateTo, scroll }) {
  return (
    <section id="home" className="hero">
      <div className="hero-image" />
      <div className="hero-shade" />
      <div className="hero-copy">
        <p className="eyebrow reveal">PLAN <i /> TRAVEL <i /> EXPLORE</p>
        <h1 className="reveal">SHADOW</h1>
        <div className="brush" />
        <h2 className="reveal">TOUR PACKAGES</h2>
        <p className="script">
          With you.<br />
          like a{' '}
          <span style={{ color: 'white', textShadow: '0 0 8px rgba(255,0,0,0.7), 2px 2px 4px rgba(0,0,0,0.5)' }}>
            SHADOW!
          </span>
        </p>
        <p className="intro">Discover unforgettable destinations with comfortable journeys and memorable experiences.</p>

        <div className="actions">
          <Button className="reveal heartbeat" onClick={() => navigateTo('contact')}>Book Now</Button>
          <Button className="reveal" secondary onClick={() => scroll('destinations')}>View destinations</Button>
        </div>

        <div className="proof">
          <span><BusFront />Premium<br />Buses</span>
          <span><Mountain />Breathtaking<br />Destinations</span>
          <span><ShieldCheck />Experienced<br />Crew</span>
          <span><Hotel />Comfortable <br /> Stay</span>
        </div>

        <div className="package-section">
          <div className="package-title">
            <span></span>
            <h3>CHOOSE YOUR PACKAGE</h3>
            <span></span>
          </div>

          <div className="package-cards">
            <div className="package-card standard reveal">
              <h4>STANDARD PACKAGE</h4>
              <p>Essential travel services<br />with comfortable arrangements.</p>
            </div>

            <div className="package-card premium reveal">
              <h4>PREMIUM PACKAGE</h4>
              <p>Enhanced comfort, additional<br />facilities and personalized<br />arrangements.</p>
            </div>
          </div>

          <p className="package-note reveal">
            Both packages can be customized according to<br />
            the budget, preferences and requirements.
          </p>

          <p className="package-tagline reveal">
            Any Place. Any Occasion. Any Group.
          </p>
        </div>
      </div>
    </section>
  );
}