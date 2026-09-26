import { MapPin, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/common/Button.jsx';
import {
  destinationPackages,
  destinationPageConfig,
} from '../data/destinationPackages.js';
import '../styles/Destinations.css';

export default function Destinations({ navigateTo }) {
  const [selectedState, setSelectedState] = useState('All');

  const states = [
    'All',
    ...destinationPackages.map((item) => item.state),
  ];

  const filteredDestinations =
    selectedState === 'All'
      ? destinationPackages
      : destinationPackages.filter(
          (item) => item.state === selectedState
        );

  return (
    <main className="destinations-page">
      {/* HERO */}
      <section
        className="destinations-page-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              180deg,
              rgba(0, 15, 35, 0.30),
              rgba(0, 12, 28, 0.94)
            ),
            url("${destinationPageConfig.heroImage}")
          `,
        }}
      >
        <div className="destinations-page-hero-content">
          <p className="eyebrow reveal">
            SHADOW TOUR PACKAGES
          </p>

          <h1 className="reveal">
            {destinationPageConfig.heroTitle}{' '}
            <em>{destinationPageConfig.heroHighlight}</em>
          </h1>

          <p className="reveal">
            {destinationPageConfig.heroDescription}
          </p>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="destinations-page-list">
        <div className="section-head reveal">
          <div>
            <p className="eyebrow">
              EXPLORE INDIA
            </p>

            <h2>
              DESTINATIONS <em> BY STATE</em>
            </h2>
          </div>
        </div>

        {/* FILTER */}
        <div className="destination-filter-wrapper reveal">
          <div className="destination-filter">
            {states.map((state) => (
              <button
                type="button"
                key={state}
                className={
                  selectedState === state
                    ? 'filter-active'
                    : ''
                }
                onClick={() => setSelectedState(state)}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* STATES */}
        {filteredDestinations.map((state) => (
          <div
            className="destination-state"
            key={state.state}
          >
            <div className="destination-state-header">
              <div>
                <p className="eyebrow">
                  EXPLORE
                </p>

                <h3>
                  {state.state}
                </h3>
              </div>

              <span>
                {state.places.length} Destinations
              </span>
            </div>

            {/* key={selectedState} restarts the entrance animation on click */}
            <div
              className="destination-state-grid"
              key={selectedState}
            >
              {state.places.map((place) => (
                <article
                  className="destination-large-card animate-filter-in"
                  key={place.id}
                >
                  <div
                    className="destination-large-image"
                    style={{
                      backgroundImage: `
                        linear-gradient(
                          0deg,
                          rgba(0, 12, 28, 0.92),
                          transparent 70%
                        ),
                        url("${place.image}")
                      `,
                    }}
                  >
                    <div className="destination-large-info">
                      <p>{place.days}</p>

                      <h4>{place.name}</h4>

                      <span>
                        <MapPin size={15} />
                        {state.state}
                      </span>
                    </div>
                  </div>

                  <div className="destination-large-bottom">
                    <Button
                      onClick={() => navigateTo('contact')}
                    >
                      ENQUIRY
                      
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}