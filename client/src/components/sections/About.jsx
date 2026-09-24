import Button from '../common/Button.jsx';

export default function About({ navigateTo }) {
  return (
    <section id="about" className="about section">
      <div>
        <p className="eyebrow blue">ABOUT US</p>
        <h3 className="reveal">MORE THAN TRAVEL<br /><em>IT’S A CONNECTION</em></h3>
        <p className="reveal">
          At Shadow Tour Packages, we believe travel is more than just reaching a destination. It’s about the people you meet, the stories you collect, and the moments that stay with you forever.
        </p>
        <Button className="reveal heartbeat" onClick={() => navigateTo('gallery')}>Our Memories (Gallery)</Button>
      </div>
      <div className="about-photo reveal">
        <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1100&q=85" alt="Mountain journey" />
        <div className="play reveal">▶</div>
        <strong>JOURNEYS<br />THAT INSPIRE</strong>
      </div>
    </section>
  );
}