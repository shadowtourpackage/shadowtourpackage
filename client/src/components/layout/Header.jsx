import { Menu, X } from 'lucide-react';
import Button from '../common/Button.jsx';
import { nav, sectionFor } from '../../data/navigation.js';

export default function Header({ menu, setMenu, active, navigateTo }) {
  return (
    <header>
      <button className="brand" onClick={() => navigateTo('home')} aria-label="Shadow tours home">
        <img src="/images/logo.png" alt="Shadow Tour Packages" />
      </button>

      <nav className={menu ? 'open' : ''} aria-label="Main navigation">
        {nav.map((name) => (
          <button
            key={name}
            className={active === name ? 'active' : ''}
            onClick={() => navigateTo(sectionFor(name))}
          >
            {name}
          </button>
        ))}
        <Button onClick={() => navigateTo('contact')}>Book now</Button>
      </nav>

      <button
        className="menu"
        onClick={() => setMenu(!menu)}
        aria-label={menu ? 'Close menu' : 'Open menu'}
        aria-expanded={menu}
      >
        {menu ? <X /> : <Menu />}
      </button>
    </header>
  );
}