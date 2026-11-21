import { BUSINESS } from '../data/business.js';
import DemoControls from './DemoControls.jsx';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">{BUSINESS.name}</p>
          <p>{BUSINESS.kitchenAddress}</p>
          <p>Open {BUSINESS.hours}</p>
        </div>
        <p className="simulated-note">
          <strong>Student project.</strong> Kohsar Kitchen is fictional. Orders are simulated:
          no food is prepared, no payment is taken and nothing is sent to a server.
        </p>
        <DemoControls />
      </div>
    </footer>
  );
}
