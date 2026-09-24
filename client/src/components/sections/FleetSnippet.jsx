import { BusFront, ShieldCheck } from 'lucide-react';
import Button from '../common/Button.jsx';

export default function FleetSnippet({ navigateTo }) {
  return (
    <section className="fleet section">
      <div>
        <p className="eyebrow blue">OUR FLEET</p>
        <h3 className="reveal">TRAVEL IN <em>COMFORT &amp; STYLE</em></h3>
        <p className="reveal">Our modern fleet is designed to give you a safe, comfortable and memorable travel experience.</p>
        <div className="features reveal">
          <span><BusFront />Spacious Seating</span>
          <span><ShieldCheck />Safe &amp; Reliable</span>
        </div>
        <Button className="reveal heartbeat" onClick={() => navigateTo('fleet')}>View our fleet</Button>
      </div>
      <div className="bus-wrap reveal">
        <div className="bus-sun reveal" />
        <img src="/images/Astra.png" alt="Shadow Tours coach" />
        <span>RIDE.<br />EXPLORE.<br />BELONG.</span>
      </div>
    </section>
  );
}