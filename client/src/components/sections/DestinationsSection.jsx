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

        {/* Opens separate Destinations page */}
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
                  rgba(0,12,28,.9),
                  transparent 70%
                ),
                url('${d.image}')
              `,
            }}
          >

            <div>
              <p>{d.days}</p>

              <h4>{d.name}</h4>

              <span>
                <MapPin size={15} />
                {d.state}
              </span>
            </div>

            <Button
              className="destination-book-btn heartbeat"
              onClick={() => scroll('contact')}
            >
              ENQUIRY
            </Button>

          </article>

        ))}

      </div>

    </section>
  );
}