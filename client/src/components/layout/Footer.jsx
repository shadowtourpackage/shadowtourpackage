import { nav, sectionFor } from '../../data/navigation.js';

export default function Footer({ navigateTo }) {
  return (
    <footer>
      <img src="/images/logo.png" alt="Shadow Tour Packages" />
      <div>
        {nav.map((name) => (
          <button key={name} onClick={() => navigateTo(sectionFor(name))}>
            {name}
          </button>
        ))}
      </div>
      <p>© {new Date().getFullYear()} Shadow Tour Packages. All rights reserved.</p>
    </footer>
  );
}