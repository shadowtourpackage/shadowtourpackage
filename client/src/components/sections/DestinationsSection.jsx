import { ArrowRight, MapPin } from 'lucide-react';
import Button from '../common/Button.jsx';

export default function DestinationsSection({
  destinations,
  scroll,
  navigateTo,
}) {
  return (
    <section id="destinations" className="dest section dark">
      <div className="section-head">
        <div>
          <p className="eyebrow reveal">
            POPULAR DESTINATIONS
          </p>

          <h3 className="reveal">
            EXPLORE <em>INCREDIBLE PLACES</em>
          </h3>
        </div>

        <button
          className="text-button heartbeat"
          onClick={() => navigateTo('destinations')}
        >
          View all destinations
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="cards reveal">
        {destinations.map((d) => (
          <article
            className="card"
            key={d.id}
            style={{
              backgroundImage: `
                linear-gradient(
                  0deg,
                  rgba(0,12,28,0.92) 0%,
                  rgba(0,12,28,0.5) 50%,
                  transparent 75%
                ),
                url('${d.image}')
              `,
            }}
          >
            {/* Bottom Content Area */}
            <div className="card-details">
              {d.days && <p className="card-days">{d.days}</p>}

              <h4 className="card-title">{d.name}</h4>

              <span className="card-location">
                <MapPin size={14} />
                {d.state}
              </span>

              {/* Placed underneath location - full width & slim height */}
              <Button
                className="destination-book-btn heartbeat"
                onClick={() => scroll('contact')}
              >
                <span style={{ marginTop: '10px' }}>ENQUIRY</span>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}